import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { isDigitsOnly } from '@cnab/utils/document-parser'

export class CodigoDeOcorrenciaBoletoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'codigo_de_ocorrencia'
  readonly range: [number, number] = [16, 17]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoT(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const isValid = value != null && value.length == 2 && isDigitsOnly(value)
    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo código de ocorrência inválido: deve conter 2 dígitos numéricos',
          lineNumber: this.lineNumber,
          fieldKey: this.fieldKey,
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
