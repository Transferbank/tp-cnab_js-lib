/**
 * Types for grouping CNAB lines into bills (core + satellites).
 * 
 * A CNAB bill can be represented by multiple lines:
 * - CNAB 400: 1 core line + 0-1 optional satellite line
 * - CNAB 240: 2 core lines (P+Q mandatory) + 0-N satellite lines (R, S, Y*)
 */

import type { ParsedLine } from '../core'

/**
 * Record type in relation to bill grouping.
 */
export type GroupingRecordType = 'core' | 'satellite' | 'structural'

/**
 * Grouping rule for a specific bank format.
 */
export interface GroupingRule {
  /** Mandatory core record types, in expected order */
  mandatoryCore: string[]
  
  /** Optional satellite record types */
  optionalSatellites: string[]
  
  /** Structural record types (header/trailer) that are never part of a bill */
  structural: string[]
}

/**
 * Group of lines representing a complete bill.
 */
export interface BillGroup {
  /** Mandatory core lines, in file order */
  core: ParsedLine[]
  
  /** Optional satellite lines, in file order */
  satellites: ParsedLine[]
  
  /** Physical line number where this bill starts (1-indexed) */
  startLine: number
}

/**
 * Grouping error.
 */
export interface GroupingError {
  line: number
  column: string
  message: string
}

/**
 * Result of grouping lines into bills.
 */
export interface GroupingResult {
  /** Bill groups identified in the file */
  groups: BillGroup[]
  
  /** Errors found during grouping */
  errors: GroupingError[]
}
