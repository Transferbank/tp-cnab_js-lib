import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BradescoBoletoVencimentoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'vencimento'
  readonly range: [number, number] = [78, 85]

  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.parse()
    const isValid = parseDateDDMMAAAA(value) !== null

    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo vencimento inválido: deve ser data no formato DDMMAAAA`,
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
