import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFixedContent } from '@cnab/type/cnab-line-schema'

export const SICOOB_CNAB400_RETORNO_TRAILER_FIXED_CONTENT: CnabFixedContent[] = [
  { range: [1, 1], value: '9' },
  { range: [2, 3], value: '02' },
  { range: [4, 6], value: CnabBank.toCode(CnabBank.SICOOB) },
]
