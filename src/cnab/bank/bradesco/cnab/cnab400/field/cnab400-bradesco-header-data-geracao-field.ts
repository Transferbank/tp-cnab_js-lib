import { CnabField } from '@cnab/type/cnab-field'
import { parseDateDDMMAA } from '@cnab/utils/date-parser'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  createCnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'

export class Cnab400BradescoHeaderDataGeracaoField extends CnabField {
  static readonly fieldType = CnabFieldType.HEADER
  readonly fieldName = 'data de geração'
  readonly range: [number, number] = [94, 100]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isHeader(this.rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = parseDateDDMMAA(value) != null
    const errors = []

    if (!isValid) {
      errors.push(
        createCnabValidationError({
          message: 'Campo data de geração inválido: deve ser data no formato DDMMAA',
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
    return this.getRangeValue()
  }
}