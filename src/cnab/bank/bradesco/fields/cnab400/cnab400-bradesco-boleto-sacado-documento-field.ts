import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { validateDocument } from '@cnab/utils/document-parser'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BradescoBoletoSacadoDocumentoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'sacado documento'
  readonly range: [number, number] = [221, 234]
  static shouldValidate(rawLine: string): boolean {
    return Cnab400LineTypeChecker.isDetalhe(rawLine)
  }
  validate(): CnabValidationResult {
    const value = this.getRangeValue()
    const isValid = validateDocument(value)
    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo sacado documento inválido: deve ser CPF ou CNPJ válido`,
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }
  parse(): string {
    return this.getRangeValue()
  }
}
