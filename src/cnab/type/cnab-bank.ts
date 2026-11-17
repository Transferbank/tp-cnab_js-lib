// O padrão namespace+enum é idiomático e recomendado pelo próprio
// TypeScript Handbook para adicionar métodos a enums
// Mas causa warning , que pode ser suprimido sem problema
/* eslint-disable @typescript-eslint/no-namespace */
export enum CnabBank {
  ITAU = 'itau',
  CAIXA = 'caixa',
  SICOOB = 'sicoob',
  SICREDI = 'sicredi',
  BRADESCO = 'bradesco',
  SANTANDER = 'santander',
  BANCODOBRASIL = 'bancodobrasil'
}

const BANK_CODES: Record<CnabBank, string> = {
  [CnabBank.ITAU]: '341',
  [CnabBank.CAIXA]: '104',
  [CnabBank.SICREDI]: '748',
  [CnabBank.SICOOB]: '756',
  [CnabBank.BRADESCO]: '237',
  [CnabBank.SANTANDER]: '033',
  [CnabBank.BANCODOBRASIL]: '001'
}

export namespace CnabBank {
  export function fromCode(code: string): CnabBank | null {
    const banks = Object.keys(BANK_CODES) as CnabBank[]
    return banks.find((bank: CnabBank): boolean => BANK_CODES[bank] == code) ?? null
  }

  export function toCode(bank: CnabBank): string {
    return BANK_CODES[bank]
  }
}