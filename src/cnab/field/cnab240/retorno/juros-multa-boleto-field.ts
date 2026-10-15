import { ValorBoletoField } from '@cnab/field/cnab240/retorno/valor-boleto-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class JurosMultaBoletoField extends ValorBoletoField {
  readonly fieldKey = 'juros_multa'
  readonly range: [number, number] = [18, 32]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoU(this.rawLine)
  }
}
