import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFixedContent } from '@cnab/type/cnab-line-schema'

export function sicoobCnab400RetornoTrailerFixedContent(bank: CnabBank): CnabFixedContent[] {
  return [
    { range: [1, 1], value: '9' },
    { range: [2, 3], value: '02' },
    { range: [4, 6], value: CnabBank.toCode(bank) },
  ]
}
