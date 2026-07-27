/**
 * Extraction of canonical fields from parsed lines.
 * 
 * Iterates through fields of bill lines (core + satellites) and builds
 * CNABHeader, CNABData and CNABTrailer objects from mappings declared
 * in the `canonical` field of each FieldDefinition.
 */

import type { ParsedLine } from '../types/core'
import type { CNABHeader, CNABData, CNABTrailer } from '../types/read'
import type { BillGroup } from '../types/processing/grouping'
import type { CanonicalField } from '../types/read'
import { parseDate, formatDateBR } from '../utils/date-parser'
import { CNABUnknownFieldCodeError } from '../types/errors'

/**
 * Campos canônicos de data — sempre formatados via parseDate + formatDateBR,
 * nunca copiados crus. Data inválida ou sentinela de "zerado" vira `undefined`
 * (parseDate('00000000', 'DDMMAAAA') já retorna null pra esse caso).
 */
const DATE_FIELDS = new Set<CanonicalField>([
  'vencimento',
  'dataEmissao',
  'dataGeracao',
  'multa.vigenciaAPartirDe',
  'juros.vigenciaAPartirDe',
  'desconto.dataLimite',
])

/**
 * Campos canônicos que são identificadores, não quantidades — sempre string
 * crua (campo.raw, aparado), nunca convertidos pra number. nossoNumero pode
 * ter mais de 16 dígitos (além do limite seguro do JS); CEP tem zero à
 * esquerda significativo.
 */
const RAW_STRING_FIELDS = new Set<CanonicalField>([
  'nossoNumero',
  'numeroDocumento',
  'sacado.endereco.cep',
])

/**
 * Documento (CPF/CNPJ) — string crua, mas com zero à esquerda removido, pra
 * ficar consistente com o comportamento já existente em CNABRecord
 * (cnab240-business-validator.ts:202, cnab400-business-validator.ts:184):
 * `payerDocument.trim().replace(/^0+/, '')`. Não inventar uma convenção nova
 * aqui — as duas APIs (validate()/read()) devem concordar sobre o mesmo dado.
 */
const DOCUMENT_FIELDS = new Set<CanonicalField>([
  'sacado.documento',
  'cedente.documento',
])

/**
 * Helper to set value in nested path (e.g., 'sacado.nome', 'sacado.endereco.cep').
 */
function setNestedValue(obj: any, path: string, value: unknown): void {
  const parts = path.split('.')
  let current = obj
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (!current[part]) {
      current[part] = {}
    }
    current = current[part]
  }
  
  const lastPart = parts[parts.length - 1]
  current[lastPart] = value
}

/**
 * Extracts canonical fields from a parsed line.
 */
function extractFieldsFromLine(line: ParsedLine, destination: any): void {
  for (const [fieldName, field] of Object.entries(line)) {
    if (fieldName === 'raw' || !field || typeof field !== 'object') {
      continue
    }
    
    const canonical = field.canonical
    if (!canonical) {
      continue
    }
    
    // Campos com interpret() continuam controlando o próprio valor
    if (typeof canonical === 'object' && canonical.field) {
      const interpretedValue = canonical.interpret(field.value, line)
      
      // Lançar exceção se interpret() retorna undefined para um valor não-zero/não-vazio
      // (código desconhecido). Valores 0 ou '' são casos esperados (campo não preenchido).
      if (interpretedValue === undefined && field.value !== 0 && field.value !== '') {
        throw new CNABUnknownFieldCodeError(canonical.field, field.value)
      }
      
      setNestedValue(destination, canonical.field, interpretedValue)
      continue
    }
    
    // Campos com canonical simples (string) - aplicar classificação
    if (typeof canonical !== 'string') {
      continue
    }
    
    let value: unknown
    
    if (DATE_FIELDS.has(canonical)) {
      // Campos de data: parsear e formatar, ou undefined se inválido/zerado
      const dateFormat = (field as any).dateFormat
      const parsed = parseDate(field.raw?.trim() || '', dateFormat)
      value = parsed ? formatDateBR(parsed) : undefined
    } else if (RAW_STRING_FIELDS.has(canonical)) {
      // Identificadores: string crua preservando zeros à esquerda e precisão
      const raw = field.raw?.trim()
      value = raw || undefined
    } else if (DOCUMENT_FIELDS.has(canonical)) {
      // Documentos: string crua sem zeros à esquerda (consistência com CNABRecord)
      const raw = field.raw?.trim().replace(/^0+/, '') || ''
      value = raw || undefined
    } else {
      // Demais campos: usar valor convertido normalmente
      value = field.value
    }
    
    if (value === undefined || value === null) {
      continue
    }
    
    setNestedValue(destination, canonical, value)
  }
}

/**
 * Extracts canonical fields from file header.
 */
export function extractHeader(headerLine: ParsedLine | undefined): CNABHeader {
  if (!headerLine) {
    return {
      cedente: {},
    }
  }
  
  const header: CNABHeader = {
    cedente: {},
  }
  
  extractFieldsFromLine(headerLine, header)
  
  return header
}

/**
 * Extracts canonical fields from file trailer.
 */
export function extractTrailer(trailerLine: ParsedLine | undefined): CNABTrailer {
  if (!trailerLine) {
    return {}
  }
  
  const trailer: CNABTrailer = {}
  
  extractFieldsFromLine(trailerLine, trailer)
  
  return trailer
}

/**
 * Extracts canonical fields from a bill (group of lines).
 */
export function extractBill(group: BillGroup): CNABData {
  const bill: CNABData = {}
  
  const allLines = [...group.core, ...group.satellites]
  
  for (const line of allLines) {
    extractFieldsFromLine(line, bill)
  }
  
  return bill
}
