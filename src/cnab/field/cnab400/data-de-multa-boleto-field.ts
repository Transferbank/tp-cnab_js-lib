import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'
import { parseDateDDMMAA } from '@cnab/utils/date-parser'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { blankIfZeros } from '@cnab/utils/phone-parser'

export class DataDeMultaBoletoField extends CnabField<Date> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'data_de_multa'
  readonly range: [number, number] = [102, 107]
  protected readonly recordType: string = '1'

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
  }

  protected extractRawValue(): string {
    return blankIfZeros(super.extractRawValue())
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseDate(rawValue: string): Date | null {
    return parseDateDDMMAA(rawValue)
  }

  protected parseValue(rawValue: string): Date {
    const date = this.parseDate(rawValue)
    if (date == null) {
      throw new CnabFieldInvalidDateError(this.fieldKey, rawValue)
    }
    return date
  }
}
