import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { blankIfZeros, isValidDdd } from '@cnab/utils/phone-parser'

export class Cnab240BoletoDddField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'ddd_do_sacado'
  protected readonly optionalRecordCode: string = '03'
  readonly range: [number, number] = [70, 71]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoY(this.rawLine, this.optionalRecordCode)
  }

  protected extractRawValue(): string {
    return blankIfZeros(super.extractRawValue())
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const isValid = value != null && isValidDdd(value)

    if (isValid) {
      return { isValid, errors: [] }
    }

    return {
      isValid,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo ddd do sacado inválido: deve conter 2 dígitos numéricos',
          lineNumber: this.lineNumber,
          fieldKey: this.fieldKey,
          range: this.range
        })
      ]
    }
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }
}
