import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { SeuNumeroBoletoField as Cnab400SeuNumeroBoletoField } from '@cnab/field/cnab400/seu-numero-boleto-field'

export class SeuNumeroBoletoField extends Cnab400SeuNumeroBoletoField {
  static readonly bank = CnabBank.SANTANDER
  static readonly format = CnabFormat.CNAB400
}
