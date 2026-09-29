import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { validateDocumentByIndicator } from '@cnab/utils/document-parser'
import { Cnab400BoletoSacadoDocumentoField } from '@cnab/field/cnab400/boleto-sacado-documento-field'

// Registro de detalhe '7' em vez de '1'. "00"=Isento: título é registrado normalmente
// sem validar CPF/CNPJ.
export class Cnab400BancoDoBrasilBoletoSacadoDocumentoField extends Cnab400BoletoSacadoDocumentoField {
  protected readonly recordType = '7'

  protected performValidation(): CnabValidationResult {
    const tipoInscricao = this.extractRangeFromLine(218, 220)

    if (tipoInscricao == '00') {
      return { isValid: true, errors: [] }
    }

    const value = this.value as string | null
    const isValid = value != null && validateDocumentByIndicator(value, tipoInscricao, '01', '02')

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
