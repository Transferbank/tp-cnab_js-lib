import { CnabField } from '@cnab/type/cnab-field'
import { isNumeric } from '@cnab/utils/field-validator'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'

export class Cnab240BradescoBoletoMultaValorField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'valor multa'
  readonly range: [number, number] = [75, 89]

  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoR(rawLine)
  }

  protected validateInternal(): CnabValidationResult {
    const value = this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
    const isValid = isNumeric(value)
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo valor multa inválido: deve conter apenas números',
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
    const value = this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
    return (parseInt(value, 10) / 100).toFixed(2)
  }
}
