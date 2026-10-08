import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { emailListErrorMessage, parseEmailList } from '@cnab/utils/email-parser'

export class Cnab240BancoDoBrasilBoletoEmailField extends CnabField<string[]> {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB240
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'email_do_sacado'
  readonly range: [number, number] = [21, 160]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoS(this.rawLine, '8')
  }

  protected performValidation(): CnabValidationResult {
    const message = emailListErrorMessage(this.value ?? [])

    if (message == null) {
      return { isValid: true, errors: [] }
    }

    return {
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message,
          lineNumber: this.lineNumber,
          fieldKey: this.fieldKey,
          range: this.range
        })
      ]
    }
  }

  protected parseValue(rawValue: string): string[] {
    return parseEmailList(rawValue)
  }
}
