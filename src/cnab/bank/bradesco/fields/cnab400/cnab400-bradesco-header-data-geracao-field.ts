import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { parseDateDDMMAA } from '@cnab/utils/date-parser'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BradescoHeaderDataGeracaoField extends CnabField {
  static readonly fieldType = CnabFieldType.HEADER
  readonly fieldName = 'data de geração'
  readonly range: [number, number] = [94, 100]
  static shouldValidate(rawLine: string): boolean {
    return Cnab400LineTypeChecker.isHeader(rawLine)
  }
  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = parseDateDDMMAA(value) != null
    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo data de geração inválido: deve ser data no formato DDMMAA`,
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