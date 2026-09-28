import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError, CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'

const DEFAULT_START = 127
const DEFAULT_END = 139
const DEFAULT_RECORD_TYPE = '1'

abstract class Cnab400BoletoValorTituloFieldBase extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'valor do título'
  abstract readonly range: [number, number]
  protected readonly recordType: string = DEFAULT_RECORD_TYPE

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

  protected parseValue(rawValue: string): number {
    if (!/^\d+$/.test(rawValue)) {
      throw new CnabFieldInvalidNumberError(this.fieldName, rawValue)
    }

    return parseInt(rawValue, 10) / 100
  }
}

export function Cnab400BoletoValorTituloField(
  start: number = DEFAULT_START,
  end: number = DEFAULT_END,
  recordType: string = DEFAULT_RECORD_TYPE
): CnabFieldClass<number> {
  return class extends Cnab400BoletoValorTituloFieldBase {
    readonly range: [number, number] = [start, end]
    protected readonly recordType = recordType
  }
}
