import { DataBoletoField } from '@cnab/field/cnab400/retorno/data-boleto-field'

export class DataDeOcorrenciaBoletoField extends DataBoletoField {
  readonly fieldKey = 'data_de_ocorrencia'
  readonly range: [number, number] = [111, 116]
}
