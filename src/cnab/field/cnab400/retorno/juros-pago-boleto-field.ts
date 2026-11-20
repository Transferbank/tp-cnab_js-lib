import { ValorBoletoField } from '@cnab/field/cnab400/retorno/valor-boleto-field'

export class JurosPagoBoletoField extends ValorBoletoField {
  readonly fieldKey = 'juros_pago'
  readonly range: [number, number] = [267, 279]
}
