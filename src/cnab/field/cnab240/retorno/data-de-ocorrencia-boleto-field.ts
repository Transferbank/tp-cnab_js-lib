import { DataBoletoField } from '@cnab/field/cnab240/retorno/data-boleto-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class DataDeOcorrenciaBoletoField extends DataBoletoField {
  readonly fieldKey = 'data_de_ocorrencia'
  readonly range: [number, number] = [138, 145]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoU(this.rawLine)
  }
}
