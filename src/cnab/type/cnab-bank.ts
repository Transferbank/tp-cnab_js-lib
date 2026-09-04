// O padrão namespace+enum é idiomático e recomendado pelo próprio
// TypeScript Handbook para adicionar métodos a enums
// Mas causa warning , que pode ser suprimido sem problema
/* eslint-disable @typescript-eslint/no-namespace */
export enum CnabBank {
  BRADESCO = 'bradesco',
  ITAU = 'itau'
}

export namespace CnabBank {
  export function fromCode(code: string): CnabBank | null {
    switch (code) {
      case '237': return CnabBank.BRADESCO
      default: return null
    }
  }
}