import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError, CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'

// Base compartilhada pelos 7 bancos - range, mensagem e comportamento sao identicos em
// todos hoje (confirmado byte a byte antes de colapsar). Cada banco continua com sua
// propria classe concreta (Cnab240<Banco>BoletoValorTituloField), que so precisa herdar
// daqui; se um banco divergir no futuro (como "nome do sacado", onde o Itau usa um range
// menor no CNAB240), a subclasse dele sobrescreve so o que for diferente.
export abstract class Cnab240BoletoValorTituloField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'valor do título'
  readonly range: [number, number] = [86, 100]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
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
