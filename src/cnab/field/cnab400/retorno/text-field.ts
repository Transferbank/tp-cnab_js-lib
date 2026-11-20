import { CnabField } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { assertValueType, formatAlphanumeric, formatNumericText } from '@cnab/utils/value-formatter'

export abstract class TextField extends CnabField<string> {
  protected readonly numeric: boolean = false

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }

  formatValue(value: unknown): string {
    assertValueType(value, 'text')
    if (this.numeric && value != null && value != '') {
      return formatNumericText(value, this.length)
    }
    return formatAlphanumeric(value ?? null, this.length)
  }
}
