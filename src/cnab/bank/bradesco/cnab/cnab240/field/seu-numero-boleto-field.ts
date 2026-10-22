import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { SeuNumeroBoletoField as Cnab240SeuNumeroBoletoField } from '@cnab/field/cnab240/seu-numero-boleto-field'

export class SeuNumeroBoletoField extends Cnab240SeuNumeroBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}
