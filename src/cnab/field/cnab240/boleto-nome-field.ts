import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'

const DEFAULT_START = 34
const DEFAULT_END = 73

export function Cnab240BoletoNomeField(start: number = DEFAULT_START, end: number = DEFAULT_END): CnabFieldClass<string> {
  return class extends CnabField<string> {
    static readonly fieldType = CnabFieldType.BOLETO
    readonly fieldKey = 'nome_do_sacado'
    readonly range: [number, number] = [start, end]

    shouldValidate(): boolean {
      return Cnab240LineTypeChecker.isSegmentoQ(this.rawLine)
    }

    protected performValidation(): CnabValidationResult {
      const minLength = 3
      const value = this.value
      const isValid = value != null && value.length >= minLength
      const errors = []

      if (!isValid) {
        errors.push(
          new CnabFieldMinLengthError({
            lineNumber: this.lineNumber,
            fieldKey: this.fieldKey,
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
