import type { BankSchema } from './bank-schema'
import type { GroupingRule, BillGroup, GroupingError } from '../processing'
import type { ParsedLine } from '../core'
import type { CNABHeader, CNABTrailer, CNABData } from '../read'
import type { CNABFormatCode } from '../core'
import type { ReadModeValue } from '../core'

export interface CNABProvider {
  bankCode: string
  format: CNABFormatCode
  mode: ReadModeValue

  schema: BankSchema
  groupingRule: GroupingRule

  group(lines: ParsedLine[]): { groups: BillGroup[]; errors: GroupingError[] }
  extractHeader(line: ParsedLine): CNABHeader
  extractTrailer(line: ParsedLine): CNABTrailer
  extractBill(group: BillGroup): CNABData
  extractBillFull(group: BillGroup): Record<string, unknown>
}
