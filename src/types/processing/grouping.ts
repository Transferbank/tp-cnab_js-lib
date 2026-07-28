/**
 * Tipos para agrupamento de linhas CNAB em boletos (núcleo + satélites).
 * 
 * Um boleto CNAB pode ser representado por múltiplas linhas:
 * - CNAB 400: 1 linha núcleo + 0-1 linha satélite opcional
 * - CNAB 240: 2 linhas núcleo (P+Q obrigatórios) + 0-N linhas satélite (R, S, Y*)
 */

import type { ParsedLine } from '../core'

export type GroupingRecordType = 'core' | 'satellite' | 'structural'

export interface GroupingRule {
  mandatoryCore: string[]
  optionalSatellites: string[]
  structural: string[]
}

export interface BillGroup {
  core: ParsedLine[]
  satellites: ParsedLine[]
  startLine: number
}

export interface GroupingError {
  line: number
  field: string
  message: string
}

export interface GroupingResult {
  groups: BillGroup[]
  errors: GroupingError[]
}
