import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { isNumeric } from '@cnab/utils/field-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BradescoBoletoAbatimentoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'abatimento'
  readonly range: [number, number] = [181, 195]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.rawLine.substring(...this.range)
    const isValid = isNumeric(value)
    const errors = []

    if (!isValid) {
      errors.push(
        CnabValidationError({
          message: 'Campo abatimento inválido: deve conter apenas números',
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
    const value = this.rawLine.substring(...this.range)
    return (parseInt(value, 10) / 100).toFixed(2)
  }
}
