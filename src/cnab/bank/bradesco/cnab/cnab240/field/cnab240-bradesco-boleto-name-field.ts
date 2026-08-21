import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'

export class Cnab240BradescoBoletoNameField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nome do sacado'
  readonly range: [number, number] = [34, 73]

  static shouldValidate(rawLine: string): boolean {
    return rawLine.length > 13 && rawLine[7] === '3' && rawLine[13] === 'Q'
  }

  protected validateInternal(): CnabValidationResult {
    const minLength = 3
    const value = this.value
    const isValid = value !== null && value.length >= minLength
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
