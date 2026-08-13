import { CnabField } from '../../../../types/cnab-field'
import { CnabFieldType } from '../../../../types/cnab-field-type'
import { CnabValidationResult } from '../../../../types/cnab-validation-result'
import { CnabValidationErrorType } from '../../../../types/cnab-validation-error-type'

export class NomeSacadoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  static readonly fieldName = 'nome'
  static readonly range: [number, number] = [234, 274]

  static shouldValidate(_rawLine: string): boolean {
    return true
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = value.length <= 40

    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo nome inválido: tamanho máximo 40 caracteres`,
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }

  parse(): string {
    return this.getFieldValue().trim()
  }
}
