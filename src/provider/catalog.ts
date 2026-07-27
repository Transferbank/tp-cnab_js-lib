/**
 * Provider catalog - factory functions for CNABProvider.
 *
 * Constrói CNABProvider a partir dos registries existentes (getBankSchema,
 * getGroupingRule). Sem cache - schema/regra já são estáticos,
 * reconstruir é barato.
 */

import type { CNABProvider } from '../types/bank/provider'
import type { CNABFormatCode } from '../types/core'
import type { ReadMode } from '../types/core'
import { getBankSchema } from '../schemas'
import { getGroupingRule } from '../grouping/grouping-rules'
import { groupLines } from '../grouping/group-lines'
import { extractHeader, extractTrailer, extractBill, extractBillFull } from '../read'

/**
 * Converte CNABFormatCode (minúsculo) para o formato esperado por
 * groupLines/getGroupingRule (maiúsculo).
 */
function toGroupingFormat(format: CNABFormatCode): 'CNAB240' | 'CNAB400' {
  return format === 'cnab240' ? 'CNAB240' : 'CNAB400'
}

/**
 * Constrói um CNABProvider a partir dos registries existentes. Retorna
 * `null` se o banco+formato não estiver cadastrado (nem em schema, nem em
 * regra de agrupamento).
 */
export function createProvider(
  bankCode: string,
  format: CNABFormatCode,
  mode: ReadMode,
): CNABProvider | null {
  const schema = getBankSchema(bankCode, format)
  const groupingRule = getGroupingRule(bankCode, toGroupingFormat(format))
  if (!schema || !groupingRule) return null

  return {
    bankCode,
    format,
    mode,
    schema,
    groupingRule,
    group: (lines) => groupLines(lines, groupingRule, toGroupingFormat(format)),
    extractHeader,
    extractTrailer,
    extractBill,
    extractBillFull,
  }
}

/**
 * Sem cache — schema/regra já são estáticos, reconstruir o Provider a cada
 * chamada é barato. Se isso mudar de custo no futuro, cachear aqui é uma
 * mudança local, não espalhada pelos callers.
 */
export function getProvider(
  bankCode: string,
  format: CNABFormatCode,
  mode: ReadMode,
): CNABProvider | null {
  return createProvider(bankCode, format, mode)
}
