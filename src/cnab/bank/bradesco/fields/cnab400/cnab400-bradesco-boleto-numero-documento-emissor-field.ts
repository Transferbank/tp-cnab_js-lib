import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { minLength } from '@cnab/utils/field-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

/**
 * Número do Documento - Número de controle/identificação da empresa emissora
 * CRÍTICO: Usado para conciliação e identificação do pagamento
 */
export class Cnab400BradescoBoletoNumeroDocumentoEmissorField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'documento emissor'
  readonly range: [number, number] = [111, 120]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine)
  }

  validate(): CnabValidationResult {
    const value = this.rawLine.substring(...this.range).trim()
    const isValid = minLength(value, 1)
    const errors = []

    if (!isValid) {
      errors.push(
        CnabValidationError({
          message: 'Campo documento emissor inválido: deve conter ao menos 1 caractere',
          errorType: CnabValidationErrorType.FIELD,
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
    return this.rawLine.substring(...this.range).trim()
  }
}