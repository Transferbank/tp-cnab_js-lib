import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DescontosBoletoField as Cnab240DescontosBoletoField } from '@cnab/field/cnab240/descontos-boleto-field'

export class DescontosBoletoField extends Cnab240DescontosBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}
