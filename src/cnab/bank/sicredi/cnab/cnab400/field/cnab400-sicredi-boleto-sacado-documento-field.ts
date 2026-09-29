import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { validateDocumentByIndicator } from '@cnab/utils/document-parser'
import { Cnab400BoletoSacadoDocumentoField } from '@cnab/field/cnab400/boleto-sacado-documento-field'

// Indicador ocupa só 1 char (pos. 219); 220 é filler fixo "0".
export class Cnab400SicrediBoletoSacadoDocumentoField extends Cnab400BoletoSacadoDocumentoField {
  protected performValidation(): CnabValidationResult {
    const value = this.value as string | null
    const tipoInscricao = this.extractRangeFromLine(218, 219)
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
}
