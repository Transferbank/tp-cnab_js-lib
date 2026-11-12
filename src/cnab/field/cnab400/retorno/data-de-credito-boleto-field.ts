import { DataBoletoField } from '@cnab/field/cnab400/retorno/data-boleto-field'

export class DataDeCreditoBoletoField extends DataBoletoField {
  readonly fieldKey = 'data_de_credito'
  readonly range: [number, number] = [296, 301]
}
