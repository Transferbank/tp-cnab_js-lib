import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CelularBoletoField as Cnab400CelularBoletoField } from '@cnab/field/cnab400/celular-boleto-field'

export class CelularBoletoField extends Cnab400CelularBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
}
