import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { ParcelaBoletoField as Cnab240ParcelaBoletoField } from '@cnab/field/cnab240/parcela-boleto-field'

export class ParcelaBoletoField extends Cnab240ParcelaBoletoField {
  static readonly bank = CnabBank.SICOOB
  static readonly format = CnabFormat.CNAB240
}
