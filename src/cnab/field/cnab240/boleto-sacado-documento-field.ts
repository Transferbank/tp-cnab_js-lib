import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { validateDocumentByIndicator } from '@cnab/utils/document-parser'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

const DEFAULT_START = 19
const DEFAULT_END = 33

// Indicador de tipo de inscrição na posição 18: "1"=CPF, "2"=CNPJ.
export abstract class Cnab240BoletoSacadoDocumentoFieldBase extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'documento do sacado'
  readonly range: [number, number] = [DEFAULT_START, DEFAULT_END]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoQ(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value
    const tipoInscricao = this.extractRangeFromLine(17, 18)
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

  protected parseValue(rawValue: string): string {
    return rawValue
  }
}

export function Cnab240BoletoSacadoDocumentoField(start: number = DEFAULT_START, end: number = DEFAULT_END): CnabFieldClass<string> {
  return class extends Cnab240BoletoSacadoDocumentoFieldBase {
    readonly range: [number, number] = [start, end]
  }
}
