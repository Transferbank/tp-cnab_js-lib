import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'

export class Cnab400BradescoBoletoNameField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nome do sacado'
  readonly range: [number, number] = [235, 274]

  shouldValidate(): boolean {
    return this.rawLine.startsWith('1')
  }

  protected validateInternal(): CnabValidationResult {
    const minLength = 3
    const isValid = this.value !== null && (this.value as string).length >= minLength
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

  parse(): string {
    return this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
  }
}