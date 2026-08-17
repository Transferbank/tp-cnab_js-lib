import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'

export class Cnab240BradescoBoletoDataEmissaoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'dataEmissao'
  readonly range: [number, number] = [110, 117]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  validate(): CnabValidationResult {
    const isValid = parseDateDDMMAAAA(this.parse()) != null
    const errors = []

    if (!isValid) {
      errors.push(
        CnabValidationError({
          message: 'Campo dataEmissao inválido: deve ser data no formato DDMMAAAA',
          errorType: CnabValidationErrorType.FIELD,
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
    return this.rawLine.substring(...this.range)
  }
}
