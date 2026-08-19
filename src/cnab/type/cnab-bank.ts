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