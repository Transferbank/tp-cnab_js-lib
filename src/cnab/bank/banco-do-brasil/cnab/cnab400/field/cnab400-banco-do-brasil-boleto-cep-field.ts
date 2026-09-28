import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'

export class Cnab400BancoDoBrasilBoletoCepField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'cep do sacado'
  // Layout do CNAB 400 declara o CEP como um único campo numérico de 8 posições
  // (9(008)), diferente do CNAB 240 do mesmo banco, que separa CEP e sufixo.
  readonly range: [number, number] = [327, 334]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isOptional(this.rawLine, '7')
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const isValid = value != null && /^\d{8}$/.test(value)
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo cep do sacado inválido: deve conter 8 dígitos numéricos',
          lineNumber: this.lineNumber,
          fieldName: this.fieldName,
          range: this.range
        })
      )
    }

    return {
      isValid,
      errors
    }
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }
}
