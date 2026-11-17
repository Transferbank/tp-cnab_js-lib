import { CnabField } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'
import { blankIfZeros } from '@cnab/utils/phone-parser'
import { parseImpliedDecimal } from '@cnab/utils/value-parser'
import { assertValueType, formatImpliedDecimal } from '@cnab/utils/value-formatter'

export abstract class ValorField extends CnabField<number> {
  protected readonly decimals: number = 2

  protected extractRawValue(): string {
    return blankIfZeros(super.extractRawValue())
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): number {
    const value = parseImpliedDecimal(rawValue, this.decimals)
    if (value == null) {
      throw new CnabFieldInvalidNumberError(this.fieldKey, rawValue)
    }
    return value
  }

  formatValue(value: unknown): string {
    assertValueType(value, 'number')
    return formatImpliedDecimal(value ?? null, this.length, this.decimals)
  }
}
