// Namespace+enum é idiomático (recomendado pelo TypeScript Handbook para
// adicionar métodos a enums), mas dispara um warning que pode ser suprimido.
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

export namespace CnabBank {
  export function fromCode(code: string): CnabBank | null {
    switch (code) {
      case '341': return CnabBank.ITAU
      case '104': return CnabBank.CAIXA
      case '748': return CnabBank.SICREDI
      case '756': return CnabBank.SICOOB
      case '237': return CnabBank.BRADESCO
      case '033': return CnabBank.SANTANDER
      case '001': return CnabBank.BANCODOBRASIL
      default: return null
    }
  }
}