import { DataBoletoField } from '@cnab/field/cnab240/retorno/data-boleto-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class DataDeCreditoBoletoField extends DataBoletoField {
  readonly fieldKey = 'data_de_credito'
  readonly range: [number, number] = [146, 153]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoU(this.rawLine)
  }
}
