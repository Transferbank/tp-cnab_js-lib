import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DescontosBoletoField as Cnab400DescontosBoletoField } from '@cnab/field/cnab400/descontos-boleto-field'

export class DescontosBoletoField extends Cnab400DescontosBoletoField {
  static readonly bank = CnabBank.SANTANDER
  static readonly format = CnabFormat.CNAB400
}
