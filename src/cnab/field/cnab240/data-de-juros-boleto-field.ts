import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { blankIfZeros } from '@cnab/utils/phone-parser'

export class DataDeJurosBoletoField extends CnabField<Date> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'data_de_juros'
  readonly range: [number, number] = [119, 126]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected extractRawValue(): string {
    return blankIfZeros(super.extractRawValue())
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
