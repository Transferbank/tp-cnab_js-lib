import type { ParsedLine } from '@tp-types/core'
import type { CNABHeader, CNABData, CNABTrailer, CanonicalField } from '@tp-types/read'
import type { BillGroup } from '@tp-types/processing/grouping'
import type { DateFormat } from '@tp-types/bank'
import { parseDate, formatDateBR } from '@utils/date-parser'
import { CNABUnknownFieldCodeError } from '@tp-types/errors'

/**
 * Tipo auxiliar para objetos canônicos em construção. 
 * Usamos Record<string, unknown> porque os objetos são montados dinamicamente
 * com caminhos aninhados (ex: 'sacado.endereco.cep').
 */
type CanonicalObject = Record<string, unknown>

const DATE_FIELDS = new Set<CanonicalField>([
  'vencimento',
  'dataEmissao',
  'dataGeracao',
  'multa.vigenciaAPartirDe',
  'juros.vigenciaAPartirDe',
  'desconto.dataLimite',
])

/**
 * Identificadores (nossoNumero, CEP) mantidos como string crua.
 * nossoNumero pode exceder 16 dígitos (limite JS); CEP tem zero significativo.
 */
const RAW_STRING_FIELDS = new Set<CanonicalField>([
  'nossoNumero',
  'numeroDocumento',
  'sacado.endereco.cep',
])

/**
 * CPF/CNPJ: string crua com zeros à esquerda removidos (consistente com validators).
 */
const DOCUMENT_FIELDS = new Set<CanonicalField>([
  'sacado.documento',
  'cedente.documento',
])

function setNestedValue(obj: CanonicalObject, path: string, value: unknown): void {
  const parts = path.split('.')
  let current: CanonicalObject = obj
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    const partExists = current[part] !== null && current[part] !== undefined
    if (!partExists) {
      current[part] = {}
    }
    current = current[part] as CanonicalObject
  }
  
  const lastPart = parts[parts.length - 1]
  current[lastPart] = value
}

function extractFieldsFromLine(line: ParsedLine, destination: CanonicalObject): void {
  for (const [fieldName, field] of Object.entries(line)) {
    if (fieldName === 'raw') {
      continue
    }
    
    const fieldIsInvalid = field === null || field === undefined || typeof field !== 'object'
    if (fieldIsInvalid) {
      continue
    }
    
    const canonical = field.canonical
    const hasCanonical = canonical !== null && canonical !== undefined
    if (!hasCanonical) {
      continue
    }
    
    if (typeof canonical === 'object' && canonical.field) {
      const interpretedValue = canonical.interpret(field.value, line)
      
      // Código desconhecido (não 0 ou ''): erro
      if (interpretedValue === undefined && field.value !== 0 && field.value !== '') {
        throw new CNABUnknownFieldCodeError(canonical.field, field.value)
      }
      
      setNestedValue(destination, canonical.field, interpretedValue)
      continue
    }
    
    if (typeof canonical !== 'string') {
      continue
    }
    
    let value: unknown
    
    if (DATE_FIELDS.has(canonical)) {
      const dateFormat = field.dateFormat
      const hasValidDateFormat = dateFormat !== null && dateFormat !== undefined && typeof dateFormat === 'string'
      if (hasValidDateFormat) {
        const parsed = parseDate(field.raw?.trim() ?? '', dateFormat as DateFormat)
        const hasValidParsedDate = parsed !== null && parsed !== undefined
        value = hasValidParsedDate ? formatDateBR(parsed) : undefined
      } else {
        value = undefined
      }
    } else if (RAW_STRING_FIELDS.has(canonical)) {
      const raw = field.raw?.trim()
      const hasRawValue = raw !== null && raw !== undefined && raw.length > 0
      value = hasRawValue ? raw : undefined
    } else if (DOCUMENT_FIELDS.has(canonical)) {
      const raw = field.raw?.trim().replace(/^0+/, '') ?? ''
      const hasRawValue = raw.length > 0
      value = hasRawValue ? raw : undefined
    } else {
      value = field.value
    }
    
    if (value === undefined || value === null) {
      continue
    }
    
    setNestedValue(destination, canonical, value)
  }
}

export function extractHeader(headerLine: ParsedLine | undefined): CNABHeader {
  const hasHeaderLine = headerLine !== null && headerLine !== undefined
  if (!hasHeaderLine) {
    return {
      cedente: {},
    }
  }
  
  const header: CNABHeader = {
    cedente: {},
  }
  
  extractFieldsFromLine(headerLine, header as unknown as CanonicalObject)
  
  return header
}

export function extractTrailer(trailerLine: ParsedLine | undefined): CNABTrailer {
  const hasTrailerLine = trailerLine !== null && trailerLine !== undefined
  if (!hasTrailerLine) {
    return {}
  }
  
  const trailer: CNABTrailer = {}
  
  extractFieldsFromLine(trailerLine, trailer as unknown as CanonicalObject)
  
  return trailer
}

export function extractBill(group: BillGroup): CNABData {
  const bill: CNABData = {}
  
  const allLines = [...group.core, ...group.satellites]
  
  for (const line of allLines) {
    extractFieldsFromLine(line, bill as unknown as CanonicalObject)
  }
  
  return bill
}
