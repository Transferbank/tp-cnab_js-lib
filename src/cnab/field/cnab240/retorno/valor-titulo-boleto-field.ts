import { ValorBoletoField } from '@cnab/field/cnab240/retorno/valor-boleto-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class ValorTituloBoletoField extends ValorBoletoField {
  readonly fieldKey = 'valor_do_titulo'
  readonly range: [number, number] = [82, 96]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoT(this.rawLine)
  }
}
