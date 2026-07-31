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
): CNABProvider {
  const schema = getBankSchema(bankCode, format)
  const groupingRule = getGroupingRule(bankCode, format)

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

export function getProvider(
  bankCode: string,
  format: CNABFormatCode,
  mode: ReadMode,
): CNABProvider {
  return createProvider(bankCode, format, mode)
}
