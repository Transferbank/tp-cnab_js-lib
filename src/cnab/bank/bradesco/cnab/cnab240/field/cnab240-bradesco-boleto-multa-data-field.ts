import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'

export class Cnab240BradescoBoletoMultaDataField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'data início multa'
  readonly range: [number, number] = [67, 74]

  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoR(rawLine)
  }

  protected validateInternal(): CnabValidationResult {
    const value = this.parse()
    const isValid = parseDateDDMMAAAA(value) !== null
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo data início multa inválido: deve ser data no formato DDMMAAAA',
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
    return this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
  }
}
