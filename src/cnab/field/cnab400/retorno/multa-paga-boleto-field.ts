import { ValorBoletoField } from '@cnab/field/cnab400/retorno/valor-boleto-field'

export class MultaPagaBoletoField extends ValorBoletoField {
  readonly fieldKey = 'multa_paga'
  readonly range: [number, number] = [280, 292]
}
