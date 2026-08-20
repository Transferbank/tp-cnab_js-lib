import { CnabField } from '@cnab/type/cnab-field'
import { isNumeric } from '@cnab/utils/field-validator'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabValidationError,
  CnabGenericFieldError
} from '@cnab/type/cnab-validation-error'

/**
 * IMPORTANTE: No CNAB400, não existe campo de data para início da multa.
 *   - '0' = Sem multa
 *   - '2' = Com multa
 */
export class Cnab400BradescoBoletoMultaField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'multa'
  readonly range: [number, number] = [66, 70]

  static shouldValidate(rawLine: string): boolean {
    return Cnab400LineTypeChecker.isDetalhe(rawLine)
  }

  protected validateInternal(): CnabValidationResult {
    const indicador = this.rawLine[65]
    const errors: CnabValidationError[] = []

    if (indicador !== '0' && indicador !== '2') {
      errors.push(
        new CnabGenericFieldError({
          message: `Indicador de multa inválido: esperado '0' ou '2', recebido '${indicador}'`,
          lineNumber: this.lineNumber,
          fieldName: this.fieldName,
          range: this.range
        })
      )
      return {
        isValid: false,
        errors
      }
    }

    if (indicador === '2') {
      const percentual = this.rawLine.substring(66, 70)
      if (!isNumeric(percentual)) {
        errors.push(
          new CnabGenericFieldError({
            message: 'Percentual de multa inválido: deve conter apenas números',
            lineNumber: this.lineNumber,
            fieldName: this.fieldName,
            range: [67, 70]
          })
        )
        return {
          isValid: false,
          errors
        }
      }

      const percentualNum = parseInt(percentual, 10)
      if (percentualNum === 0) {
        errors.push(
          new CnabGenericFieldError({
            message: "Percentual de multa deve ser maior que zero quando indicador é '2'",
            lineNumber: this.lineNumber,
            fieldName: this.fieldName,
            range: [67, 70]
          })
        )
        return {
          isValid: false,
          errors
        }
      }
    }

    return { isValid: true, errors }
  }

  parse(): string {
    const indicador = this.rawLine[65]
    if (indicador !== '2') return '0.00'
    const percentualStr = this.rawLine.substring(66, 70)
    const percentual = (parseInt(percentualStr, 10) / 100).toFixed(2)
    return percentual
  }
}
