/**
 * Regras de agrupamento de linhas em boletos por banco e formato.
 * 
 * Define quais tipos de registro formam o núcleo obrigatório de um boleto
 * e quais são satélites opcionais, para cada combinação banco+formato.
 */

import type { GroupingRule } from '../types/processing/grouping'

/**
 * CNAB 400 grouping rules by bank.
 */
export const CNAB400_GROUPING_RULES: Record<string, GroupingRule> = {
  // Banco do Brasil - tipo 7 + tipo 5 opcional (multa)
  '001': {
    mandatoryCore: ['7'],
    optionalSatellites: ['5'],
    structural: ['0', '9'],
  },
  
  // Bradesco - tipo 1 + tipo 2 opcional (mensagem)
  '237': {
    mandatoryCore: ['1'],
    optionalSatellites: ['2', '6'],
    structural: ['0', '9'],
  },
  
  // Itaú - tipo 1 + tipo 2 opcional (multa)
  '341': {
    mandatoryCore: ['1'],
    optionalSatellites: ['2', '4', '5', '6'],
    structural: ['0', '9'],
  },
  
  // Santander - tipo 1, sem satélites nas fixtures atuais
  '033': {
    mandatoryCore: ['1'],
    optionalSatellites: ['8'], // PIX
    structural: ['0', '9'],
  },
  
  // Sicredi - tipo 1, satélites diversos
  '748': {
    mandatoryCore: ['1'],
    optionalSatellites: ['2', '5', '6', '7', '8'],
    structural: ['0', '9'],
  },
  
  // Sicoob - tipo 1, sem satélites nas fixtures atuais
  '756': {
    mandatoryCore: ['1'],
    optionalSatellites: [],
    structural: ['0', '9'],
  },
  
  // Caixa - tipo 1 + satélites opcionais
  '104': {
    mandatoryCore: ['1'],
    optionalSatellites: ['2', '3', '4'],
    structural: ['0', '9'],
  },
}

/**
 * CNAB 240 grouping rules by bank.
 */
export const CNAB240_GROUPING_RULES: Record<string, GroupingRule> = {
  // Bradesco
  '237': {
    mandatoryCore: ['P', 'Q'],
    optionalSatellites: ['R', 'S', 'Y01', 'Y04', 'Y50'],
    structural: ['0', '1', '5', '9'],
  },
  
  // Santander
  '033': {
    mandatoryCore: ['P', 'Q'],
    optionalSatellites: ['R', 'S', 'Y03', 'Y53'],
    structural: ['0', '1', '5', '9'],
  },
  
  // Sicredi
  '748': {
    mandatoryCore: ['P', 'Q'],
    optionalSatellites: ['R', 'S', 'Y01', 'Y04'],
    structural: ['0', '1', '5', '9'],
  },
}

/**
 * Get grouping rule for a specific bank and format.
 */
export function getGroupingRule(
  bankCode: string,
  format: 'CNAB240' | 'CNAB400',
): GroupingRule | undefined {
  const rules = format === 'CNAB240' ? CNAB240_GROUPING_RULES : CNAB400_GROUPING_RULES
  return rules[bankCode]
}
