import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BoletoDddField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'ddd_do_sacado'
  protected readonly recordType: string = '3'
  readonly range: [number, number] = [104, 105]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, this.recordType)
  }

  protected extractRawValue(): string {
    const rawValue = super.extractRawValue()
    return /^0+$/.test(rawValue) ? '' : rawValue
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const isValid = value != null && /^\d{2}$/.test(value)

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
