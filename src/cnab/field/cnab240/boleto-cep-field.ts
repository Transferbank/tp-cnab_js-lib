import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

const DEFAULT_START = 129
const DEFAULT_END = 136

abstract class Cnab240BoletoCepFieldBase extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'cep do sacado'
  abstract readonly range: [number, number]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoQ(this.rawLine)
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

export function Cnab240BoletoCepField(start: number = DEFAULT_START, end: number = DEFAULT_END): CnabFieldClass<string> {
  return class extends Cnab240BoletoCepFieldBase {
    readonly range: [number, number] = [start, end]
  }
}
