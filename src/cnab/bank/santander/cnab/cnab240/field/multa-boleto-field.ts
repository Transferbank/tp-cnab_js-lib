import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { MultaBoletoField as Cnab240MultaBoletoField } from '@cnab/field/cnab240/multa-boleto-field'

export class MultaBoletoField extends Cnab240MultaBoletoField {
  static readonly bank = CnabBank.SANTANDER
  static readonly format = CnabFormat.CNAB240
}
