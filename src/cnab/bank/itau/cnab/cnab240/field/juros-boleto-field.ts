import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { JurosBoletoField as Cnab240JurosBoletoField } from '@cnab/field/cnab240/juros-boleto-field'

export class JurosBoletoField extends Cnab240JurosBoletoField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB240
}
