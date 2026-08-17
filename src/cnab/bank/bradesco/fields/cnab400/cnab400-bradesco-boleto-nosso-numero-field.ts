import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { isNumeric } from '@cnab/utils/field-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

/**
 * Nosso Número - Identificador único do boleto no banco
 * CRÍTICO: É a chave primária para localizar o título no sistema do banco
 */
export class Cnab400BradescoBoletoNossoNumeroField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nosso numero'
  readonly range: [number, number] = [71, 81]
  static shouldValidate(rawLine: string): boolean {
    return Cnab400LineTypeChecker.isDetalhe(rawLine)
  }
  validate(): CnabValidationResult {
    const value = this.getRangeValue()
    const isValid = isNumeric(value)
    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo nosso numero inválido: deve conter apenas números`,
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }
  parse(): string {
    return this.getRangeValue()
  }
}