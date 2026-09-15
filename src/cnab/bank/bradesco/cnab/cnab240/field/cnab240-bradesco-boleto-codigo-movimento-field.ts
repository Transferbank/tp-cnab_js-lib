import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'

export class Cnab240BradescoBoletoCodigoMovimentoField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  static readonly isOptional = true
  readonly fieldName = 'código de movimento'
  readonly range: [number, number] = [16, 17]

  shouldValidate(): boolean {
    return this.rawLine.length > 13 && this.rawLine[7] === '3' && this.rawLine[13] === 'Y'
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): number {
    if (!/^\d+$/.test(rawValue)) {
      throw new CnabFieldInvalidNumberError(this.fieldName, rawValue)
    }

    return parseInt(rawValue, 10)
  }
}
