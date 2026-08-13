export enum CnabBank {
  BRADESCO = 'bradesco'
}

export enum CnabBankCode {
  BRADESCO = '237'
}

export function fromBankCode(code: string): CnabBankCode | null {
  switch (code) {
    case CnabBankCode.BRADESCO:
      return CnabBankCode.BRADESCO
    default:
      return null
  }
}

export function getBankFromCode(bankCode: CnabBankCode): CnabBank {
  switch (bankCode) {
    case CnabBankCode.BRADESCO:
      return CnabBank.BRADESCO
  }
}
