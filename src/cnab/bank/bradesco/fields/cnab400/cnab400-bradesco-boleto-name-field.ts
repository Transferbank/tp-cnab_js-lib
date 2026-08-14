import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { minLength } from '@cnab/utils/field-validator'

export class Cnab400BradescoBoletoNameField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nome do sacado'
  readonly range: [number, number] = [235, 274]

  static shouldValidate(rawLine: string): boolean {
    return rawLine.startsWith('1')
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = minLength(value, 3)
    return {
      isValid,
      errors: isValid ? [] : [{
        message: 'Nome do sacado no boleto espera ao menos 3 caracteres',
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }

  parse(): string {
    return this.rawLine.substring(...this.range).trim()
  }
}