import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { validateDocumentByIndicator } from '@cnab/utils/document-parser'

const DEFAULT_START = 221
const DEFAULT_END = 234
const DEFAULT_RECORD_TYPE = '1'

export abstract class Cnab400BoletoSacadoDocumentoFieldBase extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'documento do sacado'
  readonly range: [number, number] = [DEFAULT_START, DEFAULT_END]
  protected readonly recordType: string = DEFAULT_RECORD_TYPE

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
  }

  protected performValidation(): CnabValidationResult {
    const value = this.value as string | null
    // Indicador de tipo de inscrição nas posições 219-220: "01"=CPF, "02"=CNPJ.
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

export function Cnab400BoletoSacadoDocumentoField(
  start: number = DEFAULT_START,
  end: number = DEFAULT_END,
  recordType: string = DEFAULT_RECORD_TYPE
): CnabFieldClass<string> {
  return class extends Cnab400BoletoSacadoDocumentoFieldBase {
    readonly range: [number, number] = [start, end]
    protected readonly recordType = recordType
  }
}
