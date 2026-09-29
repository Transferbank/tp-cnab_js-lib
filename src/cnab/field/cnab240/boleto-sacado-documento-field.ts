import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { validateDocumentByIndicator } from '@cnab/utils/document-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BoletoSacadoDocumentoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'documento_do_sacado'
  readonly range: [number, number] = [19, 33]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoQ(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    // Indicador de tipo de inscrição na posição 18: "1"=CPF, "2"=CNPJ.
    const tipoInscricao = this.extractRangeFromLine(17, 18)
    const isValid = value != null && validateDocumentByIndicator(value, tipoInscricao, '1', '2')

    const errors = []

    if (!isValid) {
      errors.push(
        new CnabGenericFieldError({
          message: 'Campo documento do sacado inválido: deve ser CPF ou CNPJ válido',
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
