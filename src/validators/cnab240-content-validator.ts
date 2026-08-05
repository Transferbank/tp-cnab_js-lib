import { extractLineFields } from '@parser/field-extractor'
import { getCnab240RecordType, getCnab240SegmentCode } from '@parser/position-reader'
import { CNAB240_SEGMENT_P_POSITIONS, CNAB240_SEGMENT_Q_POSITIONS, extractPosition, extractPositionTrimmed } from '@parser/cnab-positions'
import { BankSchema, CNABRecord, ValidationError, DateFormat, Cnab240SegmentCode, Cnab240RecordType, RecordSchema } from '@/types/all-types'
import { parseDate, isDateInPast, formatDateBR } from '@utils/date-parser'
import { validateDocument } from '@utils/string-utils'
import { ValidationResult } from '@validators/types'
import { validateHeader } from '@validators/validate-header'
import { collectFieldErrors } from '@validators/collect-field-errors'

export function validateCnab240Content(
  lines: string[],
  bankSchema: BankSchema | null,
  failFast = false
): ValidationResult {
  const errors: ValidationError[] = []
  const records: CNABRecord[] = []

  const headerSchema = bankSchema?.headerArquivo
  const segPSchema = bankSchema?.segmentoP
  const segQSchema = bankSchema?.segmentoQ

  const headerErrors = validateHeader(lines[0], headerSchema)
  errors.push(...headerErrors)
  if (failFast && headerErrors.length > 0) {
    return { errors, records }
  }

  let pendingP: { amount: number; dueDate: string } | null = null

  for (let i = 1; i < lines.length - 1; i++) {
    const line = lines[i]
    const lineNumber = i + 1

    if (getCnab240RecordType(line) !== Cnab240RecordType.DETALHE) {
      pendingP = null
      continue
    }

    const segment = getCnab240SegmentCode(line)

    if (segment === Cnab240SegmentCode.P) {
      const result = validateSegmentP(line, lineNumber, segPSchema)
      errors.push(...result.errors)
      if (failFast && result.errors.length > 0) {
        return { errors, records }
      }
      pendingP = result.pendingData
      continue
    }

    if (segment === Cnab240SegmentCode.Q) {
      const result = validateSegmentQ(line, lineNumber, segQSchema, pendingP)
      errors.push(...result.errors)
      if (failFast && result.errors.length > 0) {
        return { errors, records }
      }
      if (result.record) {
        records.push(result.record)
      }
      pendingP = null
      continue
    }

    pendingP = null
  }

  return { errors, records }
}

function validateSegmentP(
  line: string,
  lineNumber: number,
  segPSchema: RecordSchema | undefined
): {
  errors: ValidationError[]
  pendingData: { amount: number; dueDate: string }
} {
  const parsed = segPSchema ? extractLineFields(line, segPSchema) : null
  const fieldsWithError = new Set<string>()
  const errors = collectFieldErrors(parsed, lineNumber, fieldsWithError)

  const amountRaw = parsed?.valor_titulo?.raw?.trim() || extractPositionTrimmed(line, CNAB240_SEGMENT_P_POSITIONS.VALOR_TITULO)
  const dueDateRaw = parsed?.vencimento_titulo?.raw?.trim() || extractPositionTrimmed(line, CNAB240_SEGMENT_P_POSITIONS.VENCIMENTO_TITULO)
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
    if (dueDate == null) {
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

  const amountIsValid = amountRaw != null && /^\d+$/.test(amountRaw)
  const amountValue = amountIsValid ? parseInt(amountRaw) / Math.pow(10, decimals) : 0
  
  return {
    errors,
    pendingData: {
      amount: amountValue,
      dueDate: dueDate != null ? formatDateBR(dueDate) : '—',
    },
  }
}

function validateSegmentQ(
  line: string,
  lineNumber: number,
  segQSchema: RecordSchema | undefined,
  pendingP: { amount: number; dueDate: string } | null
): {
  errors: ValidationError[]
  record: CNABRecord | null
} {
  const errors: ValidationError[] = []

  if (pendingP == null) {
    errors.push({
      line: lineNumber,
      field: 'Segmento Q',
      message: 'Segmento Q sem Segmento P válido correspondente — valor/vencimento indisponíveis',
    })
  }

  const parsed = segQSchema ? extractLineFields(line, segQSchema) : null
  const fieldsWithError = new Set<string>()
  errors.push(...collectFieldErrors(parsed, lineNumber, fieldsWithError))

  const payerDocument = parsed?.sacado_inscricao_numero?.raw || extractPosition(line, CNAB240_SEGMENT_Q_POSITIONS.SACADO_INSCRICAO_NUMERO)
  const payerName = parsed?.sacado_nome?.value || extractPositionTrimmed(line, CNAB240_SEGMENT_Q_POSITIONS.SACADO_NOME)
  const payerAddress = parsed?.sacado_endereco?.value || extractPositionTrimmed(line, CNAB240_SEGMENT_Q_POSITIONS.SACADO_ENDERECO)

  const documentIsInvalid = !validateDocument(payerDocument)
  if (!fieldsWithError.has('sacado_inscricao_numero') && documentIsInvalid) {
    errors.push({
      line: lineNumber,
      field: 'CPF/CNPJ',
      message: 'Documento inválido ou incompleto',
    })
  }

  const payerNameIsEmpty = payerName == null || (payerName as string).length < 3
  if (!fieldsWithError.has('sacado_nome') && payerNameIsEmpty) {
    errors.push({
      line: lineNumber,
      field: 'Nome do pagador',
      message: 'Nome do pagador é obrigatório',
    })
  }

  const record: CNABRecord = {
    name: (payerName as string) || '—',
    amount: pendingP?.amount ?? 0,
    dueDate: pendingP?.dueDate ?? '—',
    address: (payerAddress as string) || '—',
    document: payerDocument.trim().replace(/^0+/, ''),
  }

  return { errors, record }
}
