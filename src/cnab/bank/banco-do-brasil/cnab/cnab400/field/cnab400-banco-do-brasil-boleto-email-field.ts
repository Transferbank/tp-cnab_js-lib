import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

const EMAIL_PATTERN = /^[^\s@;]+@[^\s@;]+$/

// No Banco do Brasil CNAB400, o e-mail do pagador fica no registro 5 com 
// tipo de serviço '01' (envio de boleto por e-mail), e não no registro 3 
// como na Caixa.
export class Cnab400BancoDoBrasilBoletoEmailField extends CnabField<string[]> {
  static readonly bank = CnabBank.BANCODOBRASIL
  static readonly format = CnabFormat.CNAB400
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'email_do_sacado'
  readonly range: [number, number] = [4, 139]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isRegistro(this.rawLine, '5', '01')
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
