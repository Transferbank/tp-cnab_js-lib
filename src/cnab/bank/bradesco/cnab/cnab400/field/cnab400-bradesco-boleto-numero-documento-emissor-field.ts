import { CnabField } from '@cnab/type/cnab-field'
import { minLength } from '@cnab/utils/field-validator'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  createCnabValidationError,
  CnabValidationErrorType
} from '@cnab/type/cnab-validation-error'

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
    const value = this.getRangeValue().trim()
    const isValid = minLength(value, 1)
    const errors = []

    if (!isValid) {
      errors.push(
        createCnabValidationError({
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
    return this.getRangeValue().trim()
  }
}