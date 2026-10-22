import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CelularBoletoField } from '@cnab/field/cnab400/celular-boleto-field'

export class Cnab400CaixaBoletoCelularField extends CelularBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
}
