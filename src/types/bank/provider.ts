import type { BankSchema } from '@/types/bank/bank-types'
import type { GroupingRule, BillGroup, GroupingError } from '@/types/processing/grouping'
import type { ParsedLine } from '@/types/core/core-types'
import type { CNABHeader, CNABTrailer, CNABData } from '@/types/read/read-types'
import type { CNABFormatCode } from '@/types/core/core-types'
import type { ReadMode } from '@/types/core/core-types'

export interface CNABProvider {
  bankCode: string
  format: CNABFormatCode
  mode: ReadMode

  schema: BankSchema
  groupingRule: GroupingRule

  group(lines: ParsedLine[]): { groups: BillGroup[]; errors: GroupingError[] }
  extractHeader(line: ParsedLine | undefined): CNABHeader
  extractTrailer(line: ParsedLine | undefined): CNABTrailer
  extractBill(group: BillGroup): CNABData
  extractBillFull(group: BillGroup): Record<string, unknown>
}
