import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError, CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'

// Base compartilhada pelos 7 bancos - range, fieldName, performValidation e parseValue sao
// identicos em todos hoje. O shouldValidate default aqui (isDetalhe, registro comecando
// com '1') vale para 6 dos 7 bancos; o Banco do Brasil usa um registro de detalhe
// CNAB400 nao-padrao (comeca com '7') e sobrescreve shouldValidate inteiro na propria
// subclasse (ver cnab400-banco-do-brasil-boleto-valor-titulo-field.ts).
export abstract class Cnab400BoletoValorTituloField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'valor do título'
  readonly range: [number, number] = [127, 139]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const isValid = value !== null && value > 0
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
    const centavos = parseInt(rawValue, 10)

    if (isNaN(centavos)) {
      throw new CnabFieldInvalidNumberError(this.fieldName, rawValue)
    }

    return centavos / 100
  }
}
