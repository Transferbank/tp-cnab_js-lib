import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error-type'

export class VencimentoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'vencimento'
  readonly range: [number, number] = [120, 126]

  static shouldValidate(_rawLine: string): boolean {
    return true
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = /^\d{6}$/.test(value)

    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo vencimento inválido: deve ser data no formato DDMMAA`,
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }

  parse(): string {
    return this.getFieldValue()
  }
}