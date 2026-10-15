import { ValorBoletoField } from '@cnab/field/cnab240/retorno/valor-boleto-field'

export class ValorTituloBoletoField extends ValorBoletoField {
  readonly fieldKey = 'valor_do_titulo'
  readonly range: [number, number] = [82, 96]
  protected readonly segment = 'T'
}
