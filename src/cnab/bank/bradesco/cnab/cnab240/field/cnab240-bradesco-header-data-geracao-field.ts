import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'

export class Cnab240BradescoHeaderDataGeracaoField extends CnabField {
  static readonly fieldType = CnabFieldType.HEADER
  readonly fieldName = 'data de geração'
  readonly range: [number, number] = [144, 151]

  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isHeaderArquivo(rawLine)
  }

  protected validateInternal(): CnabValidationResult {
    const value = this.parse()
    const isValid = parseDateDDMMAAAA(value) !== null
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo data de geração inválido: deve ser data no formato DDMMAAAA',
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
