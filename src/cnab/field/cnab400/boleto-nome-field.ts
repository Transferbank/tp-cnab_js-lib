import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'

const DEFAULT_START = 235
const DEFAULT_END = 274
const DEFAULT_RECORD_TYPE = '1'

// Fabrica uma classe do campo nome com o range e o tipo de registro de detalhe
// informados. Sem argumentos usa os valores padrao (comuns a 5 dos 7 bancos); o Itau
// diverge so no range; o Banco do Brasil diverge em ambos (range [235, 271] e registro
// de detalhe '7' em vez de '1').
export function Cnab400BoletoNomeField(
  start: number = DEFAULT_START,
  end: number = DEFAULT_END,
  recordType: string = DEFAULT_RECORD_TYPE
): CnabFieldClass<string> {
  return class extends CnabField<string> {
    static readonly fieldType = CnabFieldType.BOLETO
    readonly fieldName = 'nome do sacado'
    readonly range: [number, number] = [start, end]

    shouldValidate(): boolean {
      return Cnab400LineTypeChecker.isOptional(this.rawLine, recordType)
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
