import type { CNABProvider } from '@tp-types/bank/provider'
import { CNABFormatCode } from '@tp-types/core'
import type { ReadMode } from '@tp-types/core'
import { getBankSchema } from '@schemas/index'
import { getGroupingRule } from '@/grouping/grouping-rules'
import { groupLines } from '@/grouping/group-lines'
import { extractHeader, extractTrailer, extractBill, extractBillFull } from '@/read'

export function createProvider(
  bankCode: string,
  format: CNABFormatCode,
  mode: ReadMode,
): CNABProvider | null {
  const schema = getBankSchema(bankCode, format)
  const groupingRule = getGroupingRule(bankCode, format)
  
  const hasSchema = schema !== null && schema !== undefined
  const hasGroupingRule = groupingRule !== null && groupingRule !== undefined
  
  if (!hasSchema || !hasGroupingRule) return null

  return {
    bankCode,
    format,
    mode,
    schema,
    groupingRule,
    group: (lines) => groupLines(lines, groupingRule, format),
    extractHeader,
    extractTrailer,
    extractBill,
    extractBillFull,
  }
}

/**
 * Sem cache — schema/regra já são estáticos, reconstruir Provider é barato.
 * Se custo mudar, cachear aqui é mudança local, não espalhada pelos callers.
 */
export function getProvider(
  bankCode: string,
  format: CNABFormatCode,
  mode: ReadMode,
): CNABProvider | null {
  return createProvider(bankCode, format, mode)
}
