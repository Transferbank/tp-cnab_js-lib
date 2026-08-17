import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { parseDateDDMMAA } from '@cnab/utils/date-parser'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BradescoBoletoDescontoDataField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'data limite desconto'
  readonly range: [number, number] = [173, 179]
  static shouldValidate(rawLine: string): boolean {
    return Cnab400LineTypeChecker.isDetalhe(rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    // "000000" é válido (indica sem desconto)
    if (value === '000000') return {isValid: true, errors: []  }
    const isValid = parseDateDDMMAA(value) !== null
    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo data limite desconto inválido: deve ser data no formato DDMMAA ou "000000"`,
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
