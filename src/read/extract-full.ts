import type { BillGroup } from '@tp-types/processing/grouping'
import { getAllLines } from '@tp-types/processing/grouping'

/**
 * Campos numéricos que devem manter zeros à esquerda e ser retornados como string.
 * Exemplos: nossoNumero (pode exceder 16 dígitos do JS), CEP (zero significativo),
 * documentos com padding.
 */
const RAW_STRING_FIELDS = new Set<string>([
  'nossoNumero',
  'numeroDocumento',
  'sacadoCep',
  'cedenteCep',
])

export function extractBillFull(group: BillGroup): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const allLines = getAllLines(group)

  for (const line of allLines) {
    for (const [fieldName, field] of Object.entries(line)) {
      if (field == null || typeof field !== 'object') continue
      
      if (RAW_STRING_FIELDS.has(fieldName)) {
        const raw = field.raw?.trim()
        result[fieldName] = (raw != null && raw.length > 0) ? raw : field.value
      } else {
        result[fieldName] = field.value
      }
    }
  }

  return result
}
