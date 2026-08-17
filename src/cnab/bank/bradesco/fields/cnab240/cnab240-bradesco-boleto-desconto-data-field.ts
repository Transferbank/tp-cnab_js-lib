import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BradescoBoletoDescontoDataField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'data limite desconto'
  readonly range: [number, number] = [118, 125]

  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.parse()    
    // "00000000" é válido (indica sem desconto)
    if (value === '00000000') return {isValid: true,errors: []}
    const isValid = parseDateDDMMAAAA(value) !== null
    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo data limite desconto inválido: deve ser data no formato DDMMAAAA ou "00000000"`,
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
