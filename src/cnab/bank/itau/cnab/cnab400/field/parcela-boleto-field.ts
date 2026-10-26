import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { ParcelaBoletoField as Cnab400ParcelaBoletoField } from '@cnab/field/cnab400/parcela-boleto-field'

export class ParcelaBoletoField extends Cnab400ParcelaBoletoField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB400
}
