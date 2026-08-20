import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'

/**
 * Código que indica o tipo de multa:
 * - '0' = Dispensado/Isento
 * - '1' = Valor fixo
 * - '2' = Percentual
 */
export class Cnab240BradescoBoletoMultaCodigoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'codigo multa'
  readonly range: [number, number] = [66, 66]

  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoR(rawLine)
  }

  protected validateInternal(): CnabValidationResult {
    const codigo = this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
    const isValid = codigo === '0' || codigo === '1' || codigo === '2'
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: `Código de multa inválido: esperado '0', '1' ou '2', recebido '${codigo}'`,
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

  parse(): string {
    const codigo = this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
    switch (codigo) {
      case '0':
        return 'dispensado'
      case '1':
        return 'valor'
      case '2':
        return 'percentual'
      default:
        return codigo
    }
  }
}
