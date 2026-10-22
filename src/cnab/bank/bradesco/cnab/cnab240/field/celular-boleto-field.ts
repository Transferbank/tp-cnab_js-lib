import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CelularBoletoField as Cnab240CelularBoletoField } from '@cnab/field/cnab240/celular-boleto-field'

export class CelularBoletoField extends Cnab240CelularBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}
