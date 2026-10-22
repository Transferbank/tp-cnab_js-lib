import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DddBoletoField } from '@cnab/field/cnab240/ddd-boleto-field'

export class Cnab240BradescoBoletoDddField extends DddBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}
