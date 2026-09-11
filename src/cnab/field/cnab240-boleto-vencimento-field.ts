import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError, CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'
import { parseDateDDMMAAAA } from '@cnab/utils/date-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

// Base compartilhada pelos 7 bancos - range, fieldName, shouldValidate,
// performValidation e parseValue sao identicos em todos hoje (confirmado byte a byte
// antes de colapsar; o Bradesco tinha uma mensagem diferente aqui, ja corrigida em
// commit anterior). Se um banco divergir no futuro, a subclasse dele sobrescreve so
// o que for diferente, sem tocar nos outros 6.
export abstract class Cnab240BoletoVencimentoField extends CnabField<Date> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'data de vencimento'
  readonly range: [number, number] = [78, 85]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const isValid = value !== null
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
    if (date === null) {
      throw new CnabFieldInvalidDateError(this.fieldName, rawValue)
    }
    return date
  }
}
