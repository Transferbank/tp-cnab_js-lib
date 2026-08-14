import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error-type'

export class ValorTituloField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'valor_titulo'
  readonly range: [number, number] = [126, 139]

  static shouldValidate(_rawLine: string): boolean {
    return true
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = /^\d+$/.test(value)

    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo valor_titulo inválido: deve conter apenas números`,
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }

  parse(): string {
    const value = this.getFieldValue()
    const numValue = parseInt(value, 10)
    return (numValue / 100).toFixed(2)
  }
}
