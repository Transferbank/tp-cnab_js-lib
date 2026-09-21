import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { validateDocumentByIndicator } from '@cnab/utils/document-parser'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'

export class Cnab400BradescoBoletoSacadoDocumentoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'documento do sacado'
  readonly range: [number, number] = [221, 234]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value

    // Posicoes 219-220 (layout Bradesco): "01"=CPF, "02"=CNPJ. Usar o
    // indicador evita adivinhar pelo checksum, que erra em ~1% dos casos.
    const tipoInscricao = this.extractRangeFromLine(218, 220)
    const isValid = value != null && validateDocumentByIndicator(value, tipoInscricao, '01', '02')

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
