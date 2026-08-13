import { CnabField } from '../../../../types/cnab-field'
import { CnabFieldType } from '../../../../types/cnab-field-type'
import { CnabValidationResult } from '../../../../types/cnab-validation-result'
import { CnabValidationErrorType } from '../../../../types/cnab-validation-error-type'

export class VencimentoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  static readonly fieldName = 'vencimento'
  static readonly range: [number, number] = [120, 126]

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
    const [start, end] = this.range
    return this.rawLine.substring(start, end)
  }
}
