import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { 
  CnabGenericFieldError,
  CnabFieldInvalidNumberError
} from '@cnab/type/cnab-validation-error'

export class Cnab240BradescoBoletoValorTituloField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'valor do título'
  readonly range: [number, number] = [86, 100]

  shouldValidate(): boolean {
    return this.rawLine.length > 13 && this.rawLine[7] === '3' && this.rawLine[13] === 'P'
  }

  protected validateInternal(): CnabValidationResult {
    const isValid = this.value !== null && this.value > 0
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo valor do título inválido: deve ser maior que zero',
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

  protected parseValue(rawValue: string): number {
    if (!/^\d+$/.test(rawValue)) {
      throw new CnabFieldInvalidNumberError(this.fieldName, rawValue)
    }

    return parseInt(rawValue, 10) / 100
  }
}
