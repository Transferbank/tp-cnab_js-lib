import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { EmailBoletoField as Cnab240EmailBoletoField } from '@cnab/field/cnab240/email-boleto-field'

export class EmailBoletoField extends Cnab240EmailBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}
