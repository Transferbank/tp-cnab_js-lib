// O padrão namespace+enum é idiomático e recomendado pelo próprio
// TypeScript Handbook para adicionar métodos a enums
// Mas causa warning , que pode ser suprimido sem problema
/* eslint-disable @typescript-eslint/no-namespace */
export enum CnabBank {
  ITAU = 'itau',
  CAIXA = 'caixa',
  SICREDI = 'sicredi',
  BRADESCO = 'bradesco',
  SANTANDER = 'santander',
  BANCODOBRASIL = 'bancodobrasil'
}

export namespace CnabBank {
  export function fromCode(code: string): CnabBank | null {
    switch (code) {
      case '341': return CnabBank.ITAU
      case '104': return CnabBank.CAIXA
      case '748': return CnabBank.SICREDI
      case '237': return CnabBank.BRADESCO
      case '033': return CnabBank.SANTANDER
      case '001': return CnabBank.BANCODOBRASIL
      default: return null
    }
  }
}