import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

const EMAIL_PATTERN = /^[^\s@;]+@[^\s@;]+$/

// No Banco do Brasil, o campo de e-mail aceita mais de um e-mail, separados por ';' e sem espaços,
//  por isso o valor é uma lista.
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
    const emails = this.value ?? []
    const invalidEmail = emails.find((email: string) => !EMAIL_PATTERN.test(email))
    const isValid = emails.length > 0 && invalidEmail == null

    if (isValid) {
      return { isValid, errors: [] }
    }

    return {
      isValid,
      errors: [
        new CnabGenericFieldError({
          message: invalidEmail == null
            ? 'Campo email do sacado inválido: nenhum e-mail informado'
            : `Campo email do sacado inválido: ${invalidEmail} não é um e-mail`,
          lineNumber: this.lineNumber,
          fieldKey: this.fieldKey,
          range: this.range
        })
      ]
    }
  }

  protected parseValue(rawValue: string): string[] {
    return rawValue
      .split(';')
      .filter((email: string) => email.length > 0)
  }
}
