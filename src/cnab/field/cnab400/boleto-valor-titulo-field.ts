import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError, CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'

const DEFAULT_RECORD_TYPE = '1'

export function Cnab400BoletoValorTituloField(recordType: string = DEFAULT_RECORD_TYPE): CnabFieldClass<number> {
  return class extends CnabField<number> {
    static readonly fieldType = CnabFieldType.BOLETO
    readonly fieldKey = 'valor_do_titulo'
    readonly range: [number, number] = [127, 139]
    protected readonly recordType = recordType

    shouldValidate(): boolean {
      return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
    }

    protected performValidation(): CnabValidationResult {
      const value = this.value
      const isValid = value != null && value > 0
      const errors = []

      if (!isValid) {
        errors.push(
          new CnabGenericFieldError({
            message: 'Campo valor do título inválido: deve ser maior que zero',
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

    protected parseValue(rawValue: string): number {
      if (!/^\d+$/.test(rawValue)) {
        throw new CnabFieldInvalidNumberError(this.fieldKey, rawValue)
      }

      return parseInt(rawValue, 10) / 100
    }
  }
}
