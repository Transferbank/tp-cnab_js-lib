import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import {
  DocumentType,
  documentTypeByIndicator,
  normalizeDocument,
  validateDocumentByType
} from '@cnab/utils/document-parser'
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
    const isValid = value != null && validateDocumentByType(value, this.documentType())

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

  // Indicador de tipo de inscrição na posição 18: "1"=CPF, "2"=CNPJ.
  protected documentType(): DocumentType | null {
    return documentTypeByIndicator(this.extractRangeFromLine(17, 18), '1', '2')
  }

  protected parseValue(rawValue: string): string {
    return normalizeDocument(rawValue, this.documentType())
  }
}
