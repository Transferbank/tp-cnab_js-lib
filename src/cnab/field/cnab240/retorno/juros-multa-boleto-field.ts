import { ValorBoletoField } from '@cnab/field/cnab240/retorno/valor-boleto-field'

export class JurosMultaBoletoField extends ValorBoletoField {
  readonly fieldKey = 'juros_multa'
  readonly range: [number, number] = [18, 32]
  protected readonly segment = 'U'
}
