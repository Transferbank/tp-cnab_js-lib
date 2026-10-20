import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

const DEFAULT_START = 63
const DEFAULT_END = 70
const DEFAULT_RECORD_TYPE = '1'

export function Cnab400BoletoNossoNumeroField(
  start: number = DEFAULT_START,
  end: number = DEFAULT_END,
  recordType: string = DEFAULT_RECORD_TYPE
): CnabFieldClass<string> {
  return class extends CnabField<string> {
    static readonly fieldType = CnabFieldType.BOLETO
    readonly fieldKey = 'nosso_numero'
    readonly range: [number, number] = [start, end]
    protected readonly recordType = recordType

    shouldValidate(): boolean {
      return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
    }

    protected performValidation(): CnabValidationResult {
      return { isValid: true, errors: [] }
    }

    protected parseValue(rawValue: string): string {
      return rawValue
    }
  }
}
