import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240ItauBoletoCepSufixoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'sufixo do cep do sacado'
  readonly range: [number, number] = [134, 136]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoQ(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const isValid = value != null && /^\d{3}$/.test(value)
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo sufixo do cep do sacado inválido: deve conter 3 dígitos numéricos',
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
