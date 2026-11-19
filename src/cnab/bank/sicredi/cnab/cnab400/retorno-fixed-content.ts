import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFixedContent } from '@cnab/type/cnab-line-schema'

export function sicrediCnab400RetornoTrailerFixedContent(bank: CnabBank): CnabFixedContent[] {
  return [
    { range: [1, 1], value: '9' },
    { range: [2, 2], value: '2' },
    { range: [3, 5], value: CnabBank.toCode(bank) },
  ]
}
