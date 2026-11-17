import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFixedContent } from '@cnab/type/cnab-line-schema'

export const SICREDI_CNAB400_RETORNO_TRAILER_FIXED_CONTENT: CnabFixedContent[] = [
  { range: [1, 1], value: '9' },
  { range: [2, 2], value: '2' },
  { range: [3, 5], value: CnabBank.toCode(CnabBank.SICREDI) },
]
