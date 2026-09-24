import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { validateDocument } from '@cnab/utils/document-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240CaixaBoletoSacadoDocumentoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'documento do sacado'
  readonly range: [number, number] = [19, 33]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoQ(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const isValid = value != null && validateDocument(value)
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo documento do sacado inválido: deve ser CPF ou CNPJ válido',
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

  protected parseValue(rawValue: string): string {
    return rawValue
  }
}
