import { ValorPagoBoletoField as Cnab400ValorPagoBoletoField } from '@cnab/field/cnab400/retorno/valor-pago-boleto-field'

export class ValorPagoBoletoField extends Cnab400ValorPagoBoletoField {
  protected readonly recordType: string = '7'
}
