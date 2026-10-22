import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DddBoletoField as Cnab240DddBoletoField } from '@cnab/field/cnab240/ddd-boleto-field'

export class DddBoletoField extends Cnab240DddBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}
