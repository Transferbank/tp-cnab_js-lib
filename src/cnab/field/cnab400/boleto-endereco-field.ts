import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'

const DEFAULT_START = 275
const DEFAULT_END = 314
const DEFAULT_RECORD_TYPE = '1'

export function Cnab400BoletoEnderecoField(
  start: number = DEFAULT_START,
  end: number = DEFAULT_END,
  recordType: string = DEFAULT_RECORD_TYPE
): CnabFieldClass<string> {
  return class extends CnabField<string> {
    static readonly fieldType = CnabFieldType.BOLETO
    readonly fieldName = 'endereço do sacado'
    readonly range: [number, number] = [start, end]
    protected readonly recordType = recordType

    shouldValidate(): boolean {
      return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
    }

    protected performValidation(): CnabValidationResult {
      const minLength = 1
      const value = this.value
      const isValid = value != null && value.length >= minLength
      const errors = []

      if (!isValid) {
        errors.push(
          new CnabFieldMinLengthError({
            lineNumber: this.lineNumber,
            fieldName: this.fieldName,
            range: this.range,
            minLength
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
}
