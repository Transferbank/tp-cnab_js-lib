import { extractLineFields, getRecordTypePattern } from '@parser/field-extractor'
import { getCnab400RecordType } from '@parser/position-reader'
import { CNAB400_DETAIL_POSITIONS, extractPosition, extractPositionTrimmed } from '@parser/cnab-positions'
import { BankSchema, CNABRecord, ValidationError, DateFormat, BANK_CODES } from '@tp-types/index'
import { parseDate, isDateInPast, formatDateBR } from '@utils/date-parser'
import { validatePayerDocument } from '@utils/string-utils'
import { ValidationResult } from '@validators/types'

export function validateCnab400Content(lines: string[], bankSchema: BankSchema | null): ValidationResult {
  const errors: ValidationError[] = []
  const records: CNABRecord[] = []

  const headerSchema = bankSchema?.header
  const detailSchema = bankSchema?.detail

  /**
   * Tipo detalhe por schema (maioria '1', BB usa '7'). Posição 1 (charAt 0).
   */
  const detailRecordType = String(getRecordTypePattern(detailSchema, 1) ?? '1')

  const header = lines[0]
  if (headerSchema) {
    const parsedHeader = extractLineFields(header, headerSchema)
    for (const [field, data] of Object.entries(parsedHeader)) {
      if (data.error) {
        errors.push({ line: 1, field: data.descricao as string || field, message: data.error })
      }
    }
  }

  for (let i = 1; i < lines.length - 1; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    if (getCnab400RecordType(line) !== String(detailRecordType)) continue

    const parsed = detailSchema ? extractLineFields(line, detailSchema) : null
    const fieldsWithError = new Set<string>()

    if (parsed) {
      for (const [field, data] of Object.entries(parsed)) {
        if (data.error) {
          errors.push({ line: lineNumber, field: data.descricao as string || field, message: data.error })
          fieldsWithError.add(field)
        }
      }
    }

    // Extrair valores — prioriza o campo nomeado do schema do banco; se ausente, cai no
    // offset fixo do layout FEBRABAN padrão de Detalhe do CNAB 400.
    const payerName = parsed?.nome?.value || extractPositionTrimmed(line, CNAB400_DETAIL_POSITIONS.SACADO_NOME)
    const payerDocument = parsed?.sacado_numero_inscricao?.raw || extractPosition(line, CNAB400_DETAIL_POSITIONS.SACADO_DOCUMENTO)
    const payerAddress = parsed?.logradouro?.value || extractPositionTrimmed(line, CNAB400_DETAIL_POSITIONS.SACADO_ENDERECO)
    const amountRaw = parsed?.valor_titulo?.raw?.trim() || extractPositionTrimmed(line, CNAB400_DETAIL_POSITIONS.VALOR_TITULO)
    const dueDateRaw = parsed?.vencimento?.raw?.trim() || extractPositionTrimmed(line, CNAB400_DETAIL_POSITIONS.VENCIMENTO)

    // decimais/formatoData também vêm do schema quando disponível; senão assume os
    // valores padrão do CNAB 400 (2 casas decimais, data DDMMAA — ano com 2 dígitos).
    const decimals = detailSchema?.valor_titulo?.decimals ?? 2
    const dateFormat = detailSchema?.vencimento?.dateFormat || DateFormat.DDMMAA

    if (!fieldsWithError.has('nome') && (!payerName || (payerName as string).length < 3)) {
      errors.push({
        line: lineNumber,
        field: 'Nome do pagador',
        message: 'Nome do pagador é obrigatório',
      })
    }

    if (!fieldsWithError.has('sacado_numero_inscricao') && !validatePayerDocument(payerDocument)) {
      errors.push({
        line: lineNumber,
        field: 'CPF/CNPJ',
        message: 'Documento inválido ou incompleto',
      })
    }

    if (
      !fieldsWithError.has('valor_titulo') &&
      (!amountRaw || !/^\d+$/.test(amountRaw) || parseInt(amountRaw) <= 0)
    ) {
      errors.push({
        line: lineNumber,
        field: 'Valor da cobrança',
        message: 'Valor deve ser maior que R$ 0,00',
      })
    }

    // Validar data — '888888'/'999999' são literais especiais EXCLUSIVOS do Sicoob
    // ("à vista"/"contra apresentação", ver schemas/banks/sicoob/cnab400/detail.ts) e
    // não representam uma data real, então não devem ser parseados nem comparados com
    // a data atual. Restrito a bankSchema.bankCode === Sicoob: em qualquer outro banco,
    // esses valores literais em `vencimento` devem continuar sendo tratados como data
    // inválida (ver nota sobre o Banco do Brasil abaixo).
    const isSicoob = bankSchema?.bankCode === BANK_CODES.SICOOB
    const isSpecialDueDate = isSicoob && (dueDateRaw === '888888' || dueDateRaw === '999999')
    const dueDate = isSpecialDueDate ? null : parseDate(dueDateRaw, dateFormat)
    if (!fieldsWithError.has('vencimento') && !isSpecialDueDate) {
      if (!dueDate) {
        errors.push({
          line: lineNumber,
          field: 'Data de vencimento',
          message: 'Data de vencimento inválida',
        })
      } else if (isDateInPast(dueDate)) {
        errors.push({
          line: lineNumber,
          field: 'Data de vencimento',
          message: `Vencimento ${formatDateBR(dueDate)} é anterior à data atual`,
        })
      }
    }

    const amountValue =
      amountRaw && /^\d+$/.test(amountRaw) ? parseInt(amountRaw) / Math.pow(10, decimals) : 0
    records.push({
      name: (payerName as string) || '—',
      amount: amountValue,
      dueDate: dueDate ? formatDateBR(dueDate) : '—',
      address: (payerAddress as string) || '—',
      document: payerDocument.trim().replace(/^0+/, ''),
    })
  }

  return { errors, records }
}
