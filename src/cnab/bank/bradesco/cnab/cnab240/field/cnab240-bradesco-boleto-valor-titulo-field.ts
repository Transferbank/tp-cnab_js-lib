import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { 
  CnabGenericFieldError,
  CnabFieldInvalidNumberError
} from '@cnab/type/cnab-validation-error'

export class Cnab240BradescoBoletoValorTituloField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'valor titulo'
  readonly range: [number, number] = [86, 100]

  static shouldValidate(rawLine: string): boolean {
    return rawLine.length > 13 && rawLine[7] === '3' && rawLine[13] === 'P'
  }

  protected validateInternal(): CnabValidationResult {
    const isValid = this.value !== null && this.value >= 0
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo valor titulo inválido: deve ser um valor numérico positivo',
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
    const centavos = parseInt(rawValue, 10)
    
    if (isNaN(centavos)) {
      throw new CnabFieldInvalidNumberError(this.fieldName, rawValue)
    }
    
    return centavos / 100
  }
}
