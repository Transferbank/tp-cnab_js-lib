import { ValorBoletoField } from '@cnab/field/cnab400/retorno/valor-boleto-field'

export class ValorTituloBoletoField extends ValorBoletoField {
  readonly fieldKey = 'valor_do_titulo'
  readonly range: [number, number] = [153, 165]
}
