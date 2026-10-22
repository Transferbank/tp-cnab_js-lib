import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import * as Cnab240 from '@cnab/field/cnab240/fields'

export class Cnab240BradescoBoletoCelularField extends Cnab240.CelularBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}
