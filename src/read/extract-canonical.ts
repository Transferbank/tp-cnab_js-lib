import type { ParsedLine } from '@/types/core/core-types'
import type { CNABHeader, CNABData, CNABTrailer, CanonicalField } from '@/types/read/read-types'
import type { BillGroup } from '@tp-types/processing/grouping'
import { getAllLines } from '@tp-types/processing/grouping'
import type { DateFormat } from '@/types/bank/bank-types'
import { parseDate, formatDateBR } from '@utils/date-parser'
import { CNABUnknownFieldCodeError } from '@/types/errors/error-types'

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

const RAW_STRING_FIELDS = new Set<CanonicalField>([
  'nossoNumero',
  'numeroDocumento',
  'sacado.endereco.cep',
])

const DOCUMENT_FIELDS = new Set<CanonicalField>([
  'sacado.documento',
  'cedente.documento',
])

const PATH_SPLIT_CACHE = new Map<string, string[]>()

function setNestedValue(obj: CanonicalObject, path: string, value: unknown): void {
  let parts = PATH_SPLIT_CACHE.get(path)
  if (parts == null) {
    parts = path.split('.')
    PATH_SPLIT_CACHE.set(path, parts)
  }
  
  let current: CanonicalObject = obj
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (current[part] == null) {
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
    
    if (field == null || typeof field !== 'object') {
      continue
    }
    
    const canonical = field.canonical
    if (canonical == null) {
      continue
    }
    
    if (typeof canonical === 'object' && canonical.field) {
      const interpretedValue = canonical.interpret(field.value, line)
      
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
      if (dateFormat != null && typeof dateFormat === 'string') {
        const parsed = parseDate(field.raw?.trim() ?? '', dateFormat as DateFormat)
        value = parsed != null ? formatDateBR(parsed) : undefined
      } else {
        value = undefined
      }
    } else if (RAW_STRING_FIELDS.has(canonical)) {
      const raw = field.raw?.trim()
      value = (raw != null && raw.length > 0) ? raw : undefined
    } else if (DOCUMENT_FIELDS.has(canonical)) {
      const raw = field.raw?.trim().replace(/^0+/, '') ?? ''
      const hasRawValue = raw.length > 0
      value = hasRawValue ? raw : undefined
    } else {
      value = field.value
    }
    
    if (value == null) {
      continue
    }
    
    setNestedValue(destination, canonical, value)
  }
}

export function extractHeader(headerLine: ParsedLine | undefined): CNABHeader {
  if (headerLine == null) {
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
  if (trailerLine == null) {
    return {}
  }
  
  const trailer: CNABTrailer = {}
  
  extractFieldsFromLine(trailerLine, trailer as unknown as CanonicalObject)
  
  return trailer
}

export function extractBill(group: BillGroup): CNABData {
  const bill: CNABData = {}
  
  const allLines = getAllLines(group)
  
  for (const line of allLines) {
    extractFieldsFromLine(line, bill as unknown as CanonicalObject)
  }
  
  return bill
}
