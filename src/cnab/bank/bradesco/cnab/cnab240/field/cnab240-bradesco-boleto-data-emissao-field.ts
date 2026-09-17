import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'

export class Cnab240BradescoBoletoDataEmissaoField extends CnabField<Date> {
  static readonly fieldType = CnabFieldType.BOLETO
  static readonly isOptional = true
  readonly fieldName = 'data de emissão do título'
  readonly range: [number, number] = [110, 117]

  shouldValidate(): boolean {
    return this.rawLine.length > 13 && this.rawLine[7] === '3' && this.rawLine[13] === 'P'
  }

  // parseValue ja rejeita datas invalidas antes de chegarem aqui, entao
  // this.value, quando nao for null, é sempre uma data valida.
  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): Date {
    const date = parseDateDDMMAAAA(rawValue)

    if (date == null) {
      throw new CnabFieldInvalidDateError(this.fieldName, rawValue)
    }

    return date
  }
}
