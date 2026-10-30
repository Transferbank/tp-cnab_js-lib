import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { JurosBoletoField as Cnab400JurosBoletoField } from '@cnab/field/cnab400/juros-boleto-field'

export class JurosBoletoField extends Cnab400JurosBoletoField {
  static readonly bank = CnabBank.SICOOB
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [161, 166]
  protected readonly decimals: number = 4
}
