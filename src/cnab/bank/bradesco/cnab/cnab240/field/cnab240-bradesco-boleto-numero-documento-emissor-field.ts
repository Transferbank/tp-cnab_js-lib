import { CnabField } from '@cnab/type/cnab-field'
import { minLength } from '@cnab/utils/field-validator'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'

/**
 * Número do Documento - Número de controle/identificação da empresa emissora
 * CRÍTICO:  Conciliação com sistema da empresa
 */
export class Cnab240BradescoBoletoNumeroDocumentoEmissorField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'documento emissor'
  readonly range: [number, number] = [63, 77]

  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(rawLine)
  }

  protected validateInternal(): CnabValidationResult {
    const value = this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
    const isValid = minLength(value, 1)
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo documento emissor inválido: deve conter ao menos 1 caractere',
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
    return this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
  }
}