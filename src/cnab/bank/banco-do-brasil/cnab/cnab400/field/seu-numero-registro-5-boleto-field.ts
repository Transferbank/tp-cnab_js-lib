import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { SeuNumeroBoletoField as Cnab400SeuNumeroBoletoField } from '@cnab/field/cnab400/seu-numero-boleto-field'

export class SeuNumeroRegistro5BoletoField extends Cnab400SeuNumeroBoletoField {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  protected readonly recordType: string = '503'
  readonly range: [number, number] = [4, 18]
}
