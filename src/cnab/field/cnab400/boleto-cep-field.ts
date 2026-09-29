import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'

const DEFAULT_RECORD_TYPE = '1'

export function Cnab400BoletoCepField(recordType: string = DEFAULT_RECORD_TYPE): CnabFieldClass<string> {
  return class extends CnabField<string> {
    static readonly fieldType = CnabFieldType.BOLETO
    readonly fieldKey = 'cep_do_sacado'
    readonly range: [number, number] = [327, 334]
    protected readonly recordType = recordType

    shouldValidate(): boolean {
      return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
    }

    protected performValidation(): CnabValidationResult {
      const value = this.value
      const isValid = value != null && /^\d{8}$/.test(value)
      const errors = []

      if (!isValid) {
        errors.push(
          new CnabGenericFieldError({
            message: 'Campo cep do sacado inválido: deve conter 8 dígitos numéricos',
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

    protected parseValue(rawValue: string): string {
      return rawValue
    }
  }
}
