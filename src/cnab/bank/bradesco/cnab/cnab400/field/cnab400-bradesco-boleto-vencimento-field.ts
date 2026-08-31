import { CnabField } from '@cnab/type/cnab-field'
import { parseDateDDMMAA } from '@cnab/utils/date-parser'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabGenericFieldError, CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'

export class Cnab400BradescoBoletoVencimentoField extends CnabField<Date> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'data de vencimento'
  readonly range: [number, number] = [121, 126]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const isValid = this.value !== null && !isNaN(this.value.getTime())
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo data de vencimento inválido: deve ser data no formato DDMMAA',
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
    const date = parseDateDDMMAA(rawValue)
    
    if (date === null) {
      throw new CnabFieldInvalidDateError(this.fieldName, rawValue)
    }
    
    return date
  }
}
