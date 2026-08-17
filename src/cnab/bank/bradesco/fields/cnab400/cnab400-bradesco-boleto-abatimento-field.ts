import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { isNumeric } from '@cnab/utils/field-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'


export class Cnab400BradescoBoletoAbatimentoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'abatimento'
  readonly range: [number, number] = [206, 218]
  static shouldValidate(rawLine: string): boolean {
    return Cnab400LineTypeChecker.isDetalhe(rawLine)
  }
  validate(): CnabValidationResult {
    const value = this.getRangeValue()
    const isValid = isNumeric(value)
    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo abatimento inválido: deve conter apenas números`,
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }
  parse(): string {
    const value = this.getRangeValue()
    return (parseInt(value, 10) / 100).toFixed(2)
  }
}
