import { CnabField } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'
import { DateFormat, parseDate } from '@cnab/utils/date-parser'
import { blankIfZeros } from '@cnab/utils/phone-parser'
import { assertValueType, formatDate } from '@cnab/utils/value-formatter'

export abstract class DataField extends CnabField<Date> {
  protected readonly dateFormat: DateFormat = DateFormat.DDMMAA

  protected extractRawValue(): string {
    return blankIfZeros(super.extractRawValue())
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): Date {
    const date = parseDate(rawValue, this.dateFormat)
    if (date == null) {
      throw new CnabFieldInvalidDateError(this.fieldKey, rawValue)
    }
    return date
  }

  formatValue(value: unknown): string {
    assertValueType(value, 'date')
    return formatDate(value ?? null, this.dateFormat)
  }
}
