import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { isNumeric } from '@cnab/utils/field-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BradescoBoletoValorTituloField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'valor titulo'
  readonly range: [number, number] = [86, 100]

  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(rawLine)
  }

  validate(): CnabValidationResult {
    const rawValue = this.getRangeValue()
    const isValid = isNumeric(rawValue)

    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo valor titulo inválido: deve conter apenas números`,
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }

  parse(): string {
    return (parseInt(this.getRangeValue(), 10) / 100).toFixed(2)
  }
}
