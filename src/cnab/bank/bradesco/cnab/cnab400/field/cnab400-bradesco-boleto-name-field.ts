import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'

export class Cnab400BradescoBoletoNameField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nome do sacado'
  readonly range: [number, number] = [235, 274]

  shouldValidate(): boolean {
    return this.rawLine.startsWith('1')
  }

  validate(): CnabValidationResult {
    const isValid = this.parse().length >= 3
    const errors = []

    if (!isValid) {
      errors.push(
        CnabValidationError({
          message: 'Nome do sacado no boleto espera ao menos 3 caracteres',
          errorType: CnabValidationErrorType.FIELD,
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

  parse(): string {
    return this.getRangeValue().trim()
  }
}