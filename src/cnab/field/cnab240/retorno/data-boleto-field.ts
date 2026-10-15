import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export abstract class DataBoletoField extends CnabField<Date> {
  static readonly fieldType = CnabFieldType.BOLETO
  protected readonly segment: string = 'U'

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmento(this.rawLine, this.segment)
  }

  protected extractRawValue(): string {
    const rawValue = super.extractRawValue()
    return /^0+$/.test(rawValue) ? '' : rawValue
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): Date {
    const date = parseDateDDMMAAAA(rawValue)
    if (date == null) {
      throw new CnabFieldInvalidDateError(this.fieldKey, rawValue)
    }
    return date
  }
}
