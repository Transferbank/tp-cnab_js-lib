import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { isValidCPF, isValidCNPJ } from '@cnab/utils/document-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240ItauBoletoSacadoDocumentoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'documento do sacado'
  readonly range: [number, number] = [19, 33]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoQ(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value

    // Segmento Q, posicao 18 (layout Febraban): "1"=CPF, "2"=CNPJ. Usar o
    // indicador evita adivinhar pelo checksum, que erra em ~1% dos casos.
    const tipoInscricao = this.rawLine[17]
    let isValid = false
    if (value !== null) {
      if (tipoInscricao === '1') isValid = isValidCPF(value.slice(-11))
      else if (tipoInscricao === '2') isValid = isValidCNPJ(value.slice(-14).padStart(14, '0'))
    }

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
