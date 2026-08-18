import { CnabField } from '@cnab/type/cnab-field'
import { parseDateDDMMAA } from '@cnab/utils/date-parser'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabValidationError,
  createCnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'

export class Cnab400BradescoBoletoDescontoDataField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'data limite desconto'
  readonly range: [number, number] = [174, 179]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const errors: CnabValidationError[] = []

    // "000000" é válido (indica sem desconto)
    if (value === '000000') {
      return { isValid: true, errors }
    }

    const isValid = parseDateDDMMAA(value) !== null

    if (!isValid) {
      errors.push(
        createCnabValidationError({
          message: 'Campo data limite desconto inválido: deve ser data no formato DDMMAA ou "000000"',
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
