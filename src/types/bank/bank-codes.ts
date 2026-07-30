/**
 * Códigos FEBRABAN dos bancos implementados pela biblioteca
 *
 */

export const BANK_CODES = {
  BANCO_DO_BRASIL: '001',
  SANTANDER: '033',
  CAIXA: '104',
  BRADESCO: '237',
  ITAU: '341',
  SICREDI: '748',
  SICOOB: '756',
} as const

/**
 * Tipo TypeScript para códigos de banco válidos
 */
export type BankCode = (typeof BANK_CODES)[keyof typeof BANK_CODES]
