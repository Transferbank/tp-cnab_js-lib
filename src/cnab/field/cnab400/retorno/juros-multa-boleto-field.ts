import { ValorBoletoField } from '@cnab/field/cnab400/retorno/valor-boleto-field'

export class JurosMultaBoletoField extends ValorBoletoField {
  readonly fieldKey = 'juros_multa'
  readonly range: [number, number] = [267, 279]
}
