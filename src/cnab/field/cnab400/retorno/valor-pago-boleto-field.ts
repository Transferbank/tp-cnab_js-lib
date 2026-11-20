import { ValorBoletoField } from '@cnab/field/cnab400/retorno/valor-boleto-field'
import { sumRawAmounts } from '@cnab/utils/value-parser'

export class ValorPagoBoletoField extends ValorBoletoField {
  readonly fieldKey = 'valor_pago'
  readonly range: [number, number] = [254, 266]
  protected readonly addedRanges: Array<[number, number]> = []

  protected extractRawValue(): string {
    const rawAmounts = [super.extractRawValue()]
    for (const [start, end] of this.addedRanges) {
      rawAmounts.push(this.extractRangeFromLine(start - 1, end))
    }
    return sumRawAmounts(rawAmounts)
  }
}
