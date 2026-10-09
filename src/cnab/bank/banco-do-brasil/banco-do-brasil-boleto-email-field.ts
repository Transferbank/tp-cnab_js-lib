import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { emailListErrorMessage, parseEmailList } from '@cnab/utils/email-parser'

export abstract class BancoDoBrasilBoletoEmailField extends CnabField<string[]> {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'email_do_sacado'
  abstract readonly range: [number, number]

  abstract shouldValidate(): boolean

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

  handleDuplicatedValue(previousValue: unknown): string[] {
    const allEmails = [...(previousValue as string[]), ...(this.value ?? [])]
    const uniqueEmails = new Set(allEmails)
    return [...uniqueEmails]
  }

  protected parseValue(rawValue: string): string[] {
    return parseEmailList(rawValue)
  }
}
