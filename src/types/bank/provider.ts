import type { BankSchema } from './bank-schema'
import type { GroupingRule, BillGroup, GroupingError } from '@tp-types/processing'
import type { ParsedLine } from '@tp-types/core'
import type { CNABHeader, CNABTrailer, CNABData } from '@tp-types/read'
import type { CNABFormatCode } from '@tp-types/core'
import type { ReadModeValue } from '@tp-types/core'

export interface CNABProvider {
  bankCode: string
  format: CNABFormatCode
  mode: ReadModeValue

  schema: BankSchema
  groupingRule: GroupingRule

  group(lines: ParsedLine[]): { groups: BillGroup[]; errors: GroupingError[] }
  extractHeader(line: ParsedLine | undefined): CNABHeader
  extractTrailer(line: ParsedLine | undefined): CNABTrailer
  extractBill(group: BillGroup): CNABData
  extractBillFull(group: BillGroup): Record<string, unknown>
}
