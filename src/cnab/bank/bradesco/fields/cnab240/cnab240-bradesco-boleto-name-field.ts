import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { minLength } from '@cnab/utils/field-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BradescoBoletoNameField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nome do sacado'
  readonly range: [number, number] = [34, 73]

  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoQ(rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = minLength(value, 3)
    return {
      isValid,
      errors: isValid ? [] : [{
        message: 'Nome do sacado no boleto espera ao menos 3 caracteres',
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }

  parse(): string {
    return this.getRangeValue().trim()
  }
}
