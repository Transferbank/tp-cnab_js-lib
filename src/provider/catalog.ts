import type { CNABProvider } from '@tp-types/bank/provider'
import { CNABFormatCode } from '@/types/core/core-types'
import type { ReadMode } from '@/types/core/core-types'
import { getBankSchema } from '@/schemas/bank-registry'
import { getGroupingRule } from '@/grouping/grouping-rules'
import { groupLines } from '@/grouping/group-lines'
import { extractHeader, extractTrailer, extractBill, extractBillFull } from '@/read/extractors'

export function getProvider(
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
