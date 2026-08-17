import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { minLength } from '@cnab/utils/field-validator'

export class Cnab400BradescoBoletoNameField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nome do sacado'
  readonly range: [number, number] = [235, 274]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = minLength(value, 3)
    const errors = []

    if (!isValid) {
      errors.push(
        CnabValidationError({
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
