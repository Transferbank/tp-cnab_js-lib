import { ValorBoletoField } from '@cnab/field/cnab400/retorno/valor-boleto-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { isDigitsOnly } from '@cnab/utils/document-parser'
import { sumRawAmounts } from '@cnab/utils/value-parser'

export class ValorPagoBoletoField extends ValorBoletoField {
  readonly fieldKey = 'valor_pago'
  readonly range: [number, number] = [254, 266]
  protected readonly addedRanges: Array<[number, number]> = []

  validate(): CnabValidationResult {
    const ranges = [this.range, ...this.addedRanges]
    for (const range of ranges) {
      const rawAmount = this.extractRangeFromLine(range[0] - 1, range[1])
      if (rawAmount == '' || isDigitsOnly(rawAmount)) {
        continue
      }
      if (range == this.range) {
        break
      }
      return {
        isValid: false,
        errors: [
          new CnabGenericFieldError({
            message: `Campo ${this.fieldKey} com formato inválido: ${rawAmount}`,
            lineNumber: this.lineNumber,
            fieldKey: this.fieldKey,
            range
          })
        ]
      }
    }
    return super.validate()
  }

  protected extractRawValue(): string {
    const rawAmounts = [super.extractRawValue()]
    for (const [start, end] of this.addedRanges) {
      rawAmounts.push(this.extractRangeFromLine(start - 1, end))
    }
    return sumRawAmounts(rawAmounts)
  }
}
