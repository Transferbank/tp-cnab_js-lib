import { DataBoletoField } from '@cnab/field/cnab240/retorno/data-boleto-field'

export class DataDeCreditoBoletoField extends DataBoletoField {
  readonly fieldKey = 'data_de_credito'
  readonly range: [number, number] = [146, 153]
}
