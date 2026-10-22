import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import * as Cnab240 from '@cnab/field/cnab240/fields'

export class Cnab240CaixaBoletoDddField extends Cnab240.DddBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB240
  protected readonly optionalRecordCode: string = '04'
}
