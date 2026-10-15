import { DataBoletoField } from '@cnab/field/cnab240/retorno/data-boleto-field'

export class DataDeOcorrenciaBoletoField extends DataBoletoField {
  readonly fieldKey = 'data_de_ocorrencia'
  readonly range: [number, number] = [138, 145]
}
