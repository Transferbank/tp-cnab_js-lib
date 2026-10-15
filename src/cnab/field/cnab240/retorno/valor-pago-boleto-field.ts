import { ValorBoletoField } from '@cnab/field/cnab240/retorno/valor-boleto-field'

export class ValorPagoBoletoField extends ValorBoletoField {
  readonly fieldKey = 'valor_pago'
  readonly range: [number, number] = [78, 92]
  protected readonly segment = 'U'
}
