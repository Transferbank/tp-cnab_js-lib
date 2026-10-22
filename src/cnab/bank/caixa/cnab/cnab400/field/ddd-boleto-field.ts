import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DddBoletoField } from '@cnab/field/cnab400/ddd-boleto-field'

export class Cnab400CaixaBoletoDddField extends DddBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
}
