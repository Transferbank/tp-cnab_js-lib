import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  DocumentType,
  documentTypeByIndicator,
  normalizeDocument,
  validateDocumentByType
} from '@cnab/utils/document-parser'

export class Cnab400BoletoSacadoDocumentoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'documento_do_sacado'
  readonly range: [number, number] = [221, 234]
  protected readonly recordType: string = '1'

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
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

  // Indicador de tipo de inscrição nas posições 219-220: "01"=CPF, "02"=CNPJ.
  protected documentType(): DocumentType | null {
    return documentTypeByIndicator(this.extractRangeFromLine(218, 220), '01', '02')
  }

  protected parseValue(rawValue: string): string {
    return normalizeDocument(rawValue, this.documentType())
  }
}
