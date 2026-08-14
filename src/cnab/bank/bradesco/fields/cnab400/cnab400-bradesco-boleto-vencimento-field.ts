import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { parseDateDDMMAA } from '@/cnab/utils/date-parser'

export class Cnab400BradescoBoletoVencimentoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'vencimento'
  readonly range: [number, number] = [120, 126]

  static shouldValidate(rawLine: string): boolean {
    return rawLine.startsWith('1')
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = parseDateDDMMAA(value) !== null

    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo vencimento inválido: deve ser data no formato DDMMAA`,
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }

  parse(): string {
    return this.rawLine.substring(...this.range)
  }
}