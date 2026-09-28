import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'

const DEFAULT_START = 327
const DEFAULT_END = 334
const DEFAULT_RECORD_TYPE = '1'

abstract class Cnab400BoletoCepFieldBase extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldName = 'cep do sacado'
  abstract readonly range: [number, number]
  protected readonly recordType: string = DEFAULT_RECORD_TYPE

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

export function Cnab400BoletoCepField(
  start: number = DEFAULT_START,
  end: number = DEFAULT_END,
  recordType: string = DEFAULT_RECORD_TYPE
): CnabFieldClass<string> {
  return class extends Cnab400BoletoCepFieldBase {
    readonly range: [number, number] = [start, end]
    protected readonly recordType = recordType
  }
}
