import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { validateDocumentByIndicator } from '@cnab/utils/document-parser'
import { Cnab240BoletoSacadoDocumentoFieldBase } from '@cnab/field/cnab240/boleto-sacado-documento-field'

// BB aceita "0" como indicador, tratado como CNPJ.
export class Cnab240BancoDoBrasilBoletoSacadoDocumentoField extends Cnab240BoletoSacadoDocumentoFieldBase {
  protected performValidation(): CnabValidationResult {
    const value = this.value
    const tipoInscricaoBruto = this.extractRangeFromLine(17, 18)
    const tipoInscricao = tipoInscricaoBruto == '0' ? '2' : tipoInscricaoBruto
    const isValid = value != null && validateDocumentByIndicator(value, tipoInscricao, '1', '2')

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
}
