import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { MultaBoletoField as Cnab400MultaBoletoField } from '@cnab/field/cnab400/multa-boleto-field'

export class MultaBoletoField extends Cnab400MultaBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [67, 70]
}
