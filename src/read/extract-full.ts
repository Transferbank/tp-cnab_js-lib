import type { BillGroup } from '../types/processing/grouping'

/**
 * Extrai todos os campos do schema de um boleto (modo FULL), não só os
 * canônicos. Valor já convertido conforme field.type (extractLineFields já
 * faz essa conversão) — sem raw/error/canonical, só fieldName -> value.
 *
 * Conhecido, não resolvido nesta v1: campos type:'num' que são identificadores
 * (nosso número, CEP, documento) saem como number, perdendo zero à esquerda/
 * precisão. Mesmo problema já resolvido pros campos canônicos via
 * DATE_FIELDS/RAW_STRING_FIELDS em extract-canonical.ts, não estendido aqui
 * pra todo campo do schema — resolver pontualmente se algum consumidor do
 * modo FULL precisar de um campo específico afetado.
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
