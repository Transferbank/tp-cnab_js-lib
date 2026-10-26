import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DataDeJurosBoletoField as Cnab400DataDeJurosBoletoField } from '@cnab/field/cnab400/data-de-juros-boleto-field'

export class DataDeJurosBoletoField extends Cnab400DataDeJurosBoletoField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [386, 391]
}
