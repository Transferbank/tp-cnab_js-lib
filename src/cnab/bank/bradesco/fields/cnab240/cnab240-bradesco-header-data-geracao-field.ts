import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  createCnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BradescoHeaderDataGeracaoField extends CnabField {
  static readonly fieldType = CnabFieldType.HEADER
  readonly fieldName = 'data de geração'
  readonly range: [number, number] = [144, 151]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isHeaderArquivo(this.rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = parseDateDDMMAAAA(value) !== null
    const errors = []

    if (!isValid) {
      errors.push(
        createCnabValidationError({
          message: 'Campo data de geração inválido: deve ser data no formato DDMMAAAA',
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
