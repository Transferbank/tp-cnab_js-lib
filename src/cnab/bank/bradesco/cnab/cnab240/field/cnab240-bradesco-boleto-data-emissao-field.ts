import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { 
  CnabGenericFieldError,
  CnabFieldInvalidDateError
} from '@cnab/type/cnab-validation-error'

export class Cnab240BradescoBoletoDataEmissaoField extends CnabField<Date> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'data de emissão'
  readonly range: [number, number] = [110, 117]

  shouldValidate(): boolean {
    return this.rawLine.length > 13 && this.rawLine[7] === '3' && this.rawLine[13] === 'P'
  }

  protected validateInternal(): CnabValidationResult {
    const isValid = this.value !== null && !isNaN(this.value.getTime())
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo data de emissão inválido: deve ser data no formato DDMMAAAA',
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

  protected parseValue(rawValue: string): Date {
    // Formato DDMMAAAA
    const day = parseInt(rawValue.substring(0, 2), 10)
    const month = parseInt(rawValue.substring(2, 4), 10) - 1
    const year = parseInt(rawValue.substring(4, 8), 10)
    
    const date = new Date(year, month, day)
    
    if (isNaN(date.getTime())) {
      throw new CnabFieldInvalidDateError(this.fieldName, rawValue)
    }
    
    return date
  }
}
