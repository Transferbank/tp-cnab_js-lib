import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

const EMAIL_PATTERN = /^[^\s@;]+@[^\s@;]+$/

export class Cnab240BoletoEmailField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'email_do_sacado'
  protected readonly optionalRecordCode: string = '03'
  readonly range: [number, number] = [20, 69]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoY(this.rawLine, this.optionalRecordCode)
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
