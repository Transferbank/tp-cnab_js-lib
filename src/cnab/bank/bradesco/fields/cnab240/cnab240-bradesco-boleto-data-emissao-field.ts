import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'

export class Cnab240BradescoBoletoDataEmissaoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'dataEmissao'
  readonly range: [number, number] = [110, 117]
  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(rawLine)
  }
  validate(): CnabValidationResult {
    const isValid = parseDateDDMMAAAA(this.parse()) != null
    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo dataEmissao inválido: deve ser data no formato DDMMAAAA`,
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
