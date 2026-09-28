import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

const DEFAULT_START = 74
const DEFAULT_END = 113

export abstract class Cnab240BoletoEnderecoFieldBase extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'endereço do sacado'
  readonly range: [number, number] = [DEFAULT_START, DEFAULT_END]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoQ(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const minLength = 1
    const value = this.value
    const isValid = value != null && value.length >= minLength
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabFieldMinLengthError({
          lineNumber: this.lineNumber,
          fieldName: this.fieldName,
          range: this.range,
          minLength
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

export function Cnab240BoletoEnderecoField(start: number = DEFAULT_START, end: number = DEFAULT_END): CnabFieldClass<string> {
  return class extends Cnab240BoletoEnderecoFieldBase {
    readonly range: [number, number] = [start, end]
  }
}
