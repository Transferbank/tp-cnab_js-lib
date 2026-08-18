import { CnabField } from '@cnab/type/cnab-field'
import { isNumeric } from '@cnab/utils/field-validator'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  createCnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'

/**
 * Nosso Número - Identificador único do boleto no banco
 * CRÍTICO: É a chave primária para localizar o título no sistema do banco
 */
export class Cnab400BradescoBoletoNossoNumeroField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nosso numero'
  readonly range: [number, number] = [71, 81]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.getRangeValue()
    const isValid = isNumeric(value)
    const errors = []

    if (!isValid) {
      errors.push(
        createCnabValidationError({
          message: 'Campo nosso numero inválido: deve conter apenas números',
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