import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'

export class ValorTituloField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'valor titulo'
  readonly range: [number, number] = [126, 139]

  static shouldValidate(rawLine: string): boolean {
    return rawLine.startsWith('1')
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = /^\d+$/.test(value)

    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo valor titulo inválido: deve conter apenas números`,
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }

  parse(): string {
    return (parseInt(this.getFieldValue(), 10) / 100).toFixed(2)
  }
}