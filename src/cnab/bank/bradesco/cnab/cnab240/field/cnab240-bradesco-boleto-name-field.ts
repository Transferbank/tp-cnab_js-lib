import { CnabField } from '@cnab/type/cnab-field'
import { minLength } from '@cnab/utils/field-validator'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  createCnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'

export class Cnab240BradescoBoletoNameField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nome do sacado'
  readonly range: [number, number] = [34, 73]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoQ(this.rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = minLength(value, 3)
    const errors = []

    if (!isValid) {
      errors.push(
        createCnabValidationError({
          message: 'Nome do sacado no boleto espera ao menos 3 caracteres',
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
    return this.getRangeValue().trim()
  }
}
