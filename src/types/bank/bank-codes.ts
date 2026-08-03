export const BANK_CODES = {
  BANCO_DO_BRASIL: '001',
  SANTANDER: '033',
  CAIXA: '104',
  BRADESCO: '237',
  ITAU: '341',
  SICREDI: '748',
  SICOOB: '756',
} as const

export type BankCode = (typeof BANK_CODES)[keyof typeof BANK_CODES]
