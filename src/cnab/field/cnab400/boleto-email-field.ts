import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

const EMAIL_PATTERN = /^[^\s@;]+@[^\s@;]+$/

export class Cnab400BoletoEmailField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'email_do_sacado'
  protected readonly recordType: string = '3'
  protected readonly serviceType?: string
  readonly range: [number, number] = [54, 103]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, this.recordType, this.serviceType)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const isValid = value != null && EMAIL_PATTERN.test(value)

    if (isValid) {
      return { isValid, errors: [] }
    }

    return {
      isValid,
      errors: [
        new CnabGenericFieldError({
          message: `Campo email do sacado inválido: ${value} não é um e-mail`,
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
