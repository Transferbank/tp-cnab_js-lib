import { ValorPagoBoletoField as Cnab400ValorPagoBoletoField } from '@cnab/field/cnab400/retorno/valor-pago-boleto-field'

export class ValorPagoBoletoField extends Cnab400ValorPagoBoletoField {
  protected readonly addedRanges: Array<[number, number]> = [
    [267, 279], // juros
    [280, 292] // multa
  ]
}
