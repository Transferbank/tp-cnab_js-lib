import { ValorBoletoField } from '@cnab/field/cnab400/retorno/valor-boleto-field'

export class ValorPagoBoletoField extends ValorBoletoField {
  readonly fieldKey = 'valor_pago'
  readonly range: [number, number] = [254, 266]
}
