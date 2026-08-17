import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { parseDateDDMMAA } from '@cnab/utils/date-parser'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  createCnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BradescoBoletoVencimentoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'vencimento'
  readonly range: [number, number] = [121, 126]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = parseDateDDMMAA(value) != null
    const errors = []

    if (!isValid) {
      errors.push(
        createCnabValidationError({
          message: 'Campo vencimento inválido: deve ser data no formato DDMMAA',
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