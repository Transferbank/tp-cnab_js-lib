import { CnabField } from '@cnab/type/cnab-field'
import { parseDateDDMMAA } from '@cnab/utils/date-parser'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'

export class Cnab400BradescoHeaderDataGeracaoField extends CnabField {
  static readonly fieldType = CnabFieldType.HEADER
  readonly fieldName = 'data de geração'
  readonly range: [number, number] = [95, 100]

  static shouldValidate(rawLine: string): boolean {
    return Cnab400LineTypeChecker.isHeader(rawLine)
  }

  protected validateInternal(): CnabValidationResult {
    const value = this.parse().trim()
    const isValid = parseDateDDMMAA(value) != null
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo data de geração inválido: deve ser data no formato DDMMAA',
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
    return this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
  }
}