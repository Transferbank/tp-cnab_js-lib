import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export abstract class Cnab240BoletoEnderecoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'endereço do sacado'
  readonly range: [number, number] = [74, 113]

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
