import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { EmailBoletoField as Cnab400EmailBoletoField } from '@cnab/field/cnab400/email-boleto-field'

export class EmailBoletoField extends Cnab400EmailBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
}
