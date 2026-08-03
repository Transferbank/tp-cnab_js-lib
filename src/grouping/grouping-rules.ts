import type { GroupingRule } from '@tp-types/processing/grouping'
import { CNABFormatCode } from '@/types/core/core-types'
import { CNABInternalInconsistencyError } from '@/types/errors/error-types'
import { BANK_CODES } from '@/types/bank/bank-types'

export const CNAB400_GROUPING_RULES: Record<string, GroupingRule> = {
  [BANK_CODES.BANCO_DO_BRASIL]: {
    mandatoryCore: ['7'],
    optionalSatellites: ['5'],
    structural: ['0', '9'],
  },
  
  [BANK_CODES.BRADESCO]: {
    mandatoryCore: ['1'],
    optionalSatellites: ['2', '6'],
    structural: ['0', '9'],
  },
  
  [BANK_CODES.ITAU]: {
    mandatoryCore: ['1'],
    optionalSatellites: ['2', '4', '5', '6'],
    structural: ['0', '9'],
  },
  
  [BANK_CODES.SANTANDER]: {
    mandatoryCore: ['1'],
    optionalSatellites: ['8'],
    structural: ['0', '9'],
  },
  
  [BANK_CODES.SICREDI]: {
    mandatoryCore: ['1'],
    optionalSatellites: ['2', '5', '6', '7', '8'],
    structural: ['0', '9'],
  },
  
  [BANK_CODES.SICOOB]: {
    mandatoryCore: ['1'],
    optionalSatellites: [],
    structural: ['0', '9'],
  },
  
  [BANK_CODES.CAIXA]: {
    mandatoryCore: ['1'],
    optionalSatellites: ['2', '3', '4'],
    structural: ['0', '9'],
  },
}

export const CNAB240_GROUPING_RULES: Record<string, GroupingRule> = {
  [BANK_CODES.BRADESCO]: {
    mandatoryCore: ['P', 'Q'],
    optionalSatellites: ['R', 'S', 'Y01', 'Y04', 'Y50'],
    structural: ['0', '1', '5', '9'],
  },
  
  [BANK_CODES.SANTANDER]: {
    mandatoryCore: ['P', 'Q'],
    optionalSatellites: ['R', 'S', 'Y03', 'Y53'],
    structural: ['0', '1', '5', '9'],
  },
  
  [BANK_CODES.SICREDI]: {
    mandatoryCore: ['P', 'Q'],
    optionalSatellites: ['R', 'S', 'Y01', 'Y04'],
    structural: ['0', '1', '5', '9'],
  },
}


export function getGroupingRule(
  bankCode: string,
  format: CNABFormatCode,
): GroupingRule {
  const rules = format === CNABFormatCode.CNAB240 ? CNAB240_GROUPING_RULES : CNAB400_GROUPING_RULES
  const rule = rules[bankCode]
  
  if (rule == null) {
    throw new CNABInternalInconsistencyError(bankCode, format)
  }
  
  return rule
}
