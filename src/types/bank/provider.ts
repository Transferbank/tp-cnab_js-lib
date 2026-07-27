/**
 * Provider types for CNAB processing.
 * 
 * Bundle de schema + regra de agrupamento + funções de extração para um
 * banco+formato+modo específico. 100% derivado dos registries existentes
 * (getBankSchema, getGroupingRule) — nunca escrito à mão por banco.
 */

import type { BankSchema } from './bank-schema'
import type { GroupingRule, BillGroup, GroupingError } from '../processing'
import type { ParsedLine } from '../core'
import type { CNABHeader, CNABTrailer, CNABData } from '../read'
import type { CNABFormatCode } from '../core'
import type { ReadMode } from '../core'

/**
 * Bundle de schema + regra de agrupamento + funções de extração para um
 * banco+formato+modo específico. 100% derivado dos registries existentes
 * (getBankSchema, getGroupingRule) — nunca escrito à mão por banco.
 */
export interface CNABProvider {
  bankCode: string
  format: CNABFormatCode
  mode: ReadMode

  schema: BankSchema
  groupingRule: GroupingRule

  group(lines: ParsedLine[]): { groups: BillGroup[]; errors: GroupingError[] }
  extractHeader(line: ParsedLine): CNABHeader
  extractTrailer(line: ParsedLine): CNABTrailer
  extractBill(group: BillGroup): CNABData
  extractBillFull(group: BillGroup): Record<string, unknown>
}
