import type { BillGroup } from '@tp-types/processing/grouping'

/**
 * Extrai todos os campos do schema (modo FULL), não só canônicos.
 * 
 * Known issue: campos NUM que são IDs (nossoNumero, CEP, documento) perdem
 * zero à esquerda. Solução aplicada em extract-canonical (RAW_STRING_FIELDS)
 * não estendida aqui. Resolver pontualmente se consumidor FULL precisar.
 */
export function extractBillFull(group: BillGroup): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const allLines = [...group.core, ...group.satellites]

  for (const line of allLines) {
    for (const [fieldName, field] of Object.entries(line)) {
      if (!field || typeof field !== 'object') continue
      result[fieldName] = field.value
    }
  }

  return result
}
