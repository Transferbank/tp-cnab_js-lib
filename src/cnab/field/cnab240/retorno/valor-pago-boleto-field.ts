import { ValorBoletoField } from '@cnab/field/cnab240/retorno/valor-boleto-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class ValorPagoBoletoField extends ValorBoletoField {
  readonly fieldKey = 'valor_pago'
  readonly range: [number, number] = [78, 92]

  belongsToLine(): boolean {
    return Cnab240LineTypeChecker.isSegmentoU(this.rawLine)
  }

  shouldValidate(): boolean {
    return this.belongsToLine() && this.isReadableOcorrencia()
  }
}
