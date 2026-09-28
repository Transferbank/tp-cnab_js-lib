import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError, CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

const DEFAULT_START = 78
const DEFAULT_END = 85

abstract class Cnab240BoletoVencimentoFieldBase extends CnabField<Date> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'data de vencimento'
  abstract readonly range: [number, number]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const isValid = value != null
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo data de vencimento é obrigatório',
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
    if (date == null) {
      throw new CnabFieldInvalidDateError(this.fieldName, rawValue)
    }
    return date
  }
}

export function Cnab240BoletoVencimentoField(start: number = DEFAULT_START, end: number = DEFAULT_END): CnabFieldClass<Date> {
  return class extends Cnab240BoletoVencimentoFieldBase {
    readonly range: [number, number] = [start, end]
  }
}
