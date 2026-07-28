import { extractLineFields } from '@parser/field-extractor'
import { getCnab240RecordType, getCnab240SegmentCode } from '@parser/position-reader'
import { CNAB240_SEGMENT_P_POSITIONS, CNAB240_SEGMENT_Q_POSITIONS, extractPosition, extractPositionTrimmed } from '@parser/cnab-positions'
import { BankSchema, CNABRecord, ValidationError, DateFormat } from '@tp-types/index'
import { parseDate, isDateInPast, formatDateBR } from '@utils/date-parser'
import { validatePayerDocument } from '@utils/string-utils'
import { ValidationResult } from '@validators/types'

export function validateCnab240Content(lines: string[], bankSchema: BankSchema | null): ValidationResult {
  const errors: ValidationError[] = []
  const records: CNABRecord[] = []

  const headerSchema = bankSchema?.headerArquivo
  const segPSchema = bankSchema?.segmentoP
  const segQSchema = bankSchema?.segmentoQ

  const header = lines[0]
  if (headerSchema) {
    const parsedHeader = extractLineFields(header, headerSchema)
    for (const [field, data] of Object.entries(parsedHeader)) {
      if (data.error) {
        errors.push({ line: 1, field: data.descricao as string || field, message: data.error })
      }
    }
  }

  /**
   * Pareamento P+Q: guarda dados do P anterior. Qualquer linha entre P e Q quebra.
   */
  let pendingP: { amount: number; dueDate: string } | null = null

  for (let i = 1; i < lines.length - 1; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    if (getCnab240RecordType(line) !== '3') {
      pendingP = null
      continue
    }
    const segment = getCnab240SegmentCode(line)

    if (segment === 'P') {
      const parsed = segPSchema ? extractLineFields(line, segPSchema) : null
      const fieldsWithError = new Set<string>()

      if (parsed) {
        for (const [field, data] of Object.entries(parsed)) {
          if (data.error) {
            errors.push({ line: lineNumber, field: data.descricao as string || field, message: data.error })
            fieldsWithError.add(field)
          }
        }
      }

      // Prioriza o campo nomeado do schema do banco; se o schema não definir esse campo
      // (ou não houver schema), cai no offset fixo do layout FEBRABAN padrão de Segmento P.
      const amountRaw = parsed?.valor_titulo?.raw?.trim() || extractPositionTrimmed(line, CNAB240_SEGMENT_P_POSITIONS.VALOR_TITULO)
      const dueDateRaw = parsed?.vencimento_titulo?.raw?.trim() || extractPositionTrimmed(line, CNAB240_SEGMENT_P_POSITIONS.VENCIMENTO_TITULO)
      // decimais/formatoData também vêm do schema quando disponível; senão assume os
      // valores padrão do Segmento P FEBRABAN (2 casas decimais, data DDMMAAAA).
      const decimals = segPSchema?.valor_titulo?.decimals ?? 2
      const dateFormat = segPSchema?.vencimento_titulo?.dateFormat || DateFormat.DDMMAAAA

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

      const dueDate = parseDate(dueDateRaw, dateFormat)
      if (!fieldsWithError.has('vencimento_titulo')) {
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

      pendingP = {
        amount:
          amountRaw && /^\d+$/.test(amountRaw) ? parseInt(amountRaw) / Math.pow(10, decimals) : 0,
        dueDate: dueDate ? formatDateBR(dueDate) : '—',
      }
      continue  // Não cai no bloco de Q abaixo
    }

    if (segment === 'Q') {
      if (!pendingP) {
        errors.push({
          line: lineNumber,
          field: 'Segmento Q',
          message: 'Segmento Q sem Segmento P válido correspondente — valor/vencimento indisponíveis',
        })
      }

      const parsed = segQSchema ? extractLineFields(line, segQSchema) : null
      const fieldsWithError = new Set<string>()

      if (parsed) {
        for (const [field, data] of Object.entries(parsed)) {
          if (data.error) {
            errors.push({ line: lineNumber, field: data.descricao as string || field, message: data.error })
            fieldsWithError.add(field)
          }
        }
      }

      // Mesmo padrão de fallback do Segmento P: prioriza o schema, senão usa o offset
      // fixo do Segmento Q FEBRABAN padrão.
      const payerDocument = parsed?.sacado_inscricao_numero?.raw || extractPosition(line, CNAB240_SEGMENT_Q_POSITIONS.SACADO_INSCRICAO_NUMERO)
      const payerName = parsed?.sacado_nome?.value || extractPositionTrimmed(line, CNAB240_SEGMENT_Q_POSITIONS.SACADO_NOME)
      const payerAddress = parsed?.sacado_endereco?.value || extractPositionTrimmed(line, CNAB240_SEGMENT_Q_POSITIONS.SACADO_ENDERECO)

      if (!fieldsWithError.has('sacado_inscricao_numero') && !validatePayerDocument(payerDocument)) {
        errors.push({
          line: lineNumber,
          field: 'CPF/CNPJ',
          message: 'Documento inválido ou incompleto',
        })
      }

      if (!fieldsWithError.has('sacado_nome') && (!payerName || (payerName as string).length < 3)) {
        errors.push({
          line: lineNumber,
          field: 'Nome do pagador',
          message: 'Nome do pagador é obrigatório',
        })
      }

      records.push({
        name: (payerName as string) || '—',
        amount: pendingP?.amount ?? 0,
        dueDate: pendingP?.dueDate ?? '—',
        address: (payerAddress as string) || '—',
        document: payerDocument.trim().replace(/^0+/, ''),
      })
      pendingP = null  // Consumido, não pode ser reaproveitado por um Q seguinte
      continue
    }

    // Segmento R/S/Y (ou qualquer outro que não seja P/Q) entre um P pendente e seu Q
    // invalida o pareamento — pela spec FEBRABAN, segmentos opcionais só vêm DEPOIS de
    // um par P+Q completo, nunca entre eles.
    pendingP = null
  }

  return { errors, records }
}

