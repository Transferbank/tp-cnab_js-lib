import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFixedContent } from '@cnab/type/cnab-line-schema'

export function cnab400RetornoHeaderFixedContent(bank: CnabBank): CnabFixedContent[] {
  return [
    { range: [1, 1], value: '0' },
    { range: [2, 2], value: '2' },
    { range: [3, 9], value: 'RETORNO' },
    { range: [10, 11], value: '01' },
    { range: [12, 19], value: 'COBRANCA' },
    { range: [77, 79], value: CnabBank.toCode(bank) },
  ]
}

export function cnab400RetornoTrailerFixedContent(bank: CnabBank): CnabFixedContent[] {
  return [
    { range: [1, 1], value: '9' },
    { range: [2, 2], value: '2' },
    { range: [3, 4], value: '01' },
    { range: [5, 7], value: CnabBank.toCode(bank) },
  ]
}

export function cnab400RetornoDetalheFixedContent(recordType: string): CnabFixedContent[] {
  return [
    { range: [1, 1], value: recordType },
  ]
}
