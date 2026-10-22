import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import * as Cnab400 from '@cnab/field/cnab400/fields'

export class Cnab400CaixaBoletoCelularField extends Cnab400.CelularBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
}
