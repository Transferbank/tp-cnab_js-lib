import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'

export class Cnab400BradescoBoletoNameField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nome do sacado'
  readonly range: [number, number] = [235, 274]

  shouldValidate(): boolean {
    return this.rawLine.startsWith('1')
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = value.length >= 3
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