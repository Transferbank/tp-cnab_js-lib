import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { isNumeric } from '@cnab/utils/field-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  createCnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BradescoBoletoMultaValorField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'valor multa'
  readonly range: [number, number] = [75, 89]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoR(this.rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.getRangeValue()
    const isValid = isNumeric(value)
    const errors = []

    if (!isValid) {
      errors.push(
        createCnabValidationError({
          message: 'Campo valor multa inválido: deve conter apenas números',
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
    const value = this.getRangeValue()
    return (parseInt(value, 10) / 100).toFixed(2)
  }
}
