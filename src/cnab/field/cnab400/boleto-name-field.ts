import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'

// Base compartilhada pelos 7 bancos - fieldName, performValidation e parseValue sao
// identicos em todos hoje. Ha duas divergencias reais: o range tem 3 variantes (Itau
// [235,264], Banco do Brasil [235,271], os outros 4 [235,274] - o default aqui) e o
// shouldValidate do Banco do Brasil usa um registro de detalhe CNAB400 nao-padrao
// comecando com '7' em vez de '1'. Cada uma dessas subclasses sobrescreve so o que
// diverge (ver cnab400-itau-boleto-name-field.ts e
// cnab400-banco-do-brasil-boleto-name-field.ts).
export abstract class Cnab400BoletoNameField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'nome do sacado'
  readonly range: [number, number] = [235, 274]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const minLength = 3
    const value = this.value
    const isValid = value !== null && value.length >= minLength
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabFieldMinLengthError({
          lineNumber: this.lineNumber,
          fieldName: this.fieldName,
          range: this.range,
          minLength
        })
      )
    }

    return {
      isValid,
      errors
    }
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }
}
