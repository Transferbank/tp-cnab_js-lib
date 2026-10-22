import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { EmailBoletoField } from '@cnab/field/cnab240/email-boleto-field'

export class Cnab240CaixaBoletoEmailField extends EmailBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB240
  protected readonly optionalRecordCode: string = '04'
}
