import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { validateDocument } from '@cnab/utils/document-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'

export class Cnab240BradescoBoletoSacadoDocumentoField extends CnabField {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'sacado documento'
  readonly range: [number, number] = [19, 33]

  static shouldValidate(rawLine: string): boolean {
    return Cnab240LineTypeChecker.isSegmentoQ(rawLine)
  }

  protected validateInternal(): CnabValidationResult {
    const value = this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
    const isValid = validateDocument(value)
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo sacado documento inválido: deve ser CPF ou CNPJ válido',
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
