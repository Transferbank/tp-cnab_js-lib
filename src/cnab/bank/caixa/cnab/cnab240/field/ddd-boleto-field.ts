import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DddBoletoField } from '@cnab/field/cnab240/ddd-boleto-field'

export class Cnab240CaixaBoletoDddField extends DddBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB240
  protected readonly optionalRecordCode: string = '04'
}
