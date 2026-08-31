import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { 
  CnabGenericFieldError,
  CnabFieldInvalidDateError
} from '@cnab/type/cnab-validation-error'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BradescoBoletoVencimentoField extends CnabField<Date> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'data de vencimento'
  readonly range: [number, number] = [78, 85]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const isValid = this.value !== null && !isNaN(this.value.getTime())
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo data de vencimento inválido: deve ser data no formato DDMMAAAA',
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
    const date = parseDateDDMMAAAA(rawValue)
    
    if (date === null) {
      throw new CnabFieldInvalidDateError(this.fieldName, rawValue)
    }
    
    return date
  }
}
