import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DataDeMultaBoletoField as Cnab400DataDeMultaBoletoField } from '@cnab/field/cnab400/data-de-multa-boleto-field'

export class DataDeMultaBoletoField extends Cnab400DataDeMultaBoletoField {
  static readonly bank = CnabBank.CAIXA
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [352, 357]
}
