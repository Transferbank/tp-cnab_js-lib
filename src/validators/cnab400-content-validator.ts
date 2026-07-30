import { extractLineFields, getRecordTypePattern } from '@parser/field-extractor'
import { getCnab400RecordType } from '@parser/position-reader'
import { CNAB400_DETAIL_POSITIONS, extractPosition, extractPositionTrimmed } from '@parser/cnab-positions'
import { BankSchema, CNABRecord, ValidationError, DateFormat, BANK_CODES } from '@tp-types/index'
import { parseDate, isDateInPast, formatDateBR } from '@utils/date-parser'
import { validatePayerDocument } from '@utils/string-utils'
import { ValidationResult } from '@validators/types'

export function validateCnab400Content(
  lines: string[],
  bankSchema: BankSchema | null,
  failFast = false
): ValidationResult {
  const errors: ValidationError[] = []
  const records: CNABRecord[] = []

  const headerSchema = bankSchema?.header
  const detailSchema = bankSchema?.detail

  const detailRecordType = String(getRecordTypePattern(detailSchema, 1) ?? '1')

  const headerErrors = validateHeader(lines[0], headerSchema)
  errors.push(...headerErrors)
  if (failFast && headerErrors.length > 0) {
    return { errors, records }
  }

  for (let i = 1; i < lines.length - 1; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    if (getCnab400RecordType(line) !== String(detailRecordType)) continue

    const result = validateDetailLine(line, lineNumber, detailSchema, bankSchema)
    errors.push(...result.errors)
    if (failFast && result.errors.length > 0) {
      return { errors, records }
    }

    records.push(result.record)
  }

  return { errors, records }
}

function validateHeader(headerLine: string, headerSchema: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (headerSchema) {
    const parsedHeader = extractLineFields(headerLine, headerSchema)
    for (const [field, data] of Object.entries(parsedHeader)) {
      if (data.error) {
        errors.push({ 
          line: 1, 
          field: (data.descricao as string) || field, 
          message: data.error 
        })
      }
    }
  }

  return errors
}

function validateDetailLine(
  line: string,
  lineNumber: number,
  detailSchema: any,
  bankSchema: BankSchema | null
): {
  errors: ValidationError[]
  record: CNABRecord
} {
  const errors: ValidationError[] = []
  const parsed = detailSchema ? extractLineFields(line, detailSchema) : null
  const fieldsWithError = new Set<string>()

  if (parsed) {
    for (const [field, data] of Object.entries(parsed)) {
      if (data.error) {
        errors.push({ 
          line: lineNumber, 
          field: (data.descricao as string) || field, 
          message: data.error 
        })
        fieldsWithError.add(field)
      }
    }
  }

  const payerName = parsed?.nome?.value || extractPositionTrimmed(line, CNAB400_DETAIL_POSITIONS.SACADO_NOME)
  const payerDocument = parsed?.sacado_numero_inscricao?.raw || extractPosition(line, CNAB400_DETAIL_POSITIONS.SACADO_DOCUMENTO)
  const payerAddress = parsed?.logradouro?.value || extractPositionTrimmed(line, CNAB400_DETAIL_POSITIONS.SACADO_ENDERECO)
  const amountRaw = parsed?.valor_titulo?.raw?.trim() || extractPositionTrimmed(line, CNAB400_DETAIL_POSITIONS.VALOR_TITULO)
  const dueDateRaw = parsed?.vencimento?.raw?.trim() || extractPositionTrimmed(line, CNAB400_DETAIL_POSITIONS.VENCIMENTO)

  const decimals = detailSchema?.valor_titulo?.decimals ?? 2
  const dateFormat = detailSchema?.vencimento?.dateFormat || DateFormat.DDMMAA

  const payerNameIsEmpty = payerName === null || payerName === undefined || (payerName as string).length < 3
  if (!fieldsWithError.has('nome') && payerNameIsEmpty) {
    errors.push({
      line: lineNumber,
      field: 'Nome do pagador',
      message: 'Nome do pagador é obrigatório',
    })
  }

  const documentIsInvalid = !validatePayerDocument(payerDocument)
  if (!fieldsWithError.has('sacado_numero_inscricao') && documentIsInvalid) {
    errors.push({
      line: lineNumber,
      field: 'CPF/CNPJ',
      message: 'Documento inválido ou incompleto',
    })
  }

  const amountIsInvalid = amountRaw === null || amountRaw === undefined || !/^\d+$/.test(amountRaw) || parseInt(amountRaw) <= 0
  if (!fieldsWithError.has('valor_titulo') && amountIsInvalid) {
    errors.push({
      line: lineNumber,
      field: 'Valor da cobrança',
      message: 'Valor deve ser maior que R$ 0,00',
    })
  }

  // Sicoob: '888888'/'999999' são literais especiais ("à vista"/"contra apresentação")
  const isSicoob = bankSchema?.bankCode === BANK_CODES.SICOOB
  const isSpecialDueDate = isSicoob && (dueDateRaw === '888888' || dueDateRaw === '999999')
  const dueDate = isSpecialDueDate ? null : parseDate(dueDateRaw, dateFormat)
  
  if (!fieldsWithError.has('vencimento') && !isSpecialDueDate) {
    const dueDateIsInvalid = dueDate === null || dueDate === undefined
    if (dueDateIsInvalid) {
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

  const amountIsValid = amountRaw !== null && amountRaw !== undefined && /^\d+$/.test(amountRaw)
  const amountValue = amountIsValid ? parseInt(amountRaw) / Math.pow(10, decimals) : 0
  
  return {
    errors,
    record: {
      name: (payerName as string) || '—',
      amount: amountValue,
      dueDate: dueDate ? formatDateBR(dueDate) : '—',
      address: (payerAddress as string) || '—',
      document: payerDocument.trim().replace(/^0+/, ''),
    },
  }
}
