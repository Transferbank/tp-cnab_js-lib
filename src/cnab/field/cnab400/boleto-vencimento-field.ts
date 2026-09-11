import { CnabField } from '@cnab/type/cnab-field'
import { parseDateDDMMAA } from '@cnab/utils/date-parser'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabGenericFieldError, CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'

// Base compartilhada pelos 7 bancos - range, fieldName, performValidation e parseValue
// sao identicos em todos hoje. A unica divergencia real e o shouldValidate do Banco do
// Brasil, que usa um registro de detalhe CNAB400 nao-padrao comecando com '7' em vez de
// '1' (ver cnab400-banco-do-brasil-boleto-vencimento-field.ts).
export abstract class Cnab400BoletoVencimentoField extends CnabField<Date> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'data de vencimento'
  readonly range: [number, number] = [121, 126]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine)
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
    const date = parseDateDDMMAA(rawValue)
    if (date === null) {
      throw new CnabFieldInvalidDateError(this.fieldName, rawValue)
    }
    return date
  }
}
