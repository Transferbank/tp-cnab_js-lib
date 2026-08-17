import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { minLength } from '@cnab/utils/field-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

/**
 * Número do Documento - Número de controle/identificação da empresa emissora
 * CRÍTICO: Usado para conciliação e identificação do pagamento
 */
export class Cnab400BradescoBoletoNumeroDocumentoEmissorField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'documento emissor'
  readonly range: [number, number] = [110, 120]
  static shouldValidate(rawLine: string): boolean {
    return Cnab400LineTypeChecker.isDetalhe(rawLine)
  }
  validate(): CnabValidationResult {
    const value = this.getRangeValue().trim()
    const isValid = minLength(value, 1)
    return {
      isValid,
      errors: isValid ? [] : [{
        message: `Campo documento emissor inválido: deve conter ao menos 1 caractere`,
        errorType: CnabValidationErrorType.FIELD,
        lineNumber: this.lineNumber,
        fieldName: this.fieldName,
        range: this.range
      }]
    }
  }
  parse(): string {
    return this.getRangeValue().trim()
  }
}