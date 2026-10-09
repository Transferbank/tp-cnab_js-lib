import { CnabBank } from '@cnab/type/cnab-bank'

export interface Cnab240IdentificationFieldOptions {
  bank: CnabBank
  range?: [number, number]
}

export interface Cnab400IdentificationFieldOptions {
  bank: CnabBank
  range: [number, number]
  recordType?: string
}
