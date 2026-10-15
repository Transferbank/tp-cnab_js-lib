import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export abstract class ValorBoletoField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  protected abstract readonly segment: string

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmento(this.rawLine, this.segment)
  }

  protected extractRawValue(): string {
    const rawValue = super.extractRawValue()
    return /^0+$/.test(rawValue) ? '' : rawValue
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): number {
    if (!/^\d+$/.test(rawValue)) {
      throw new CnabFieldInvalidNumberError(this.fieldKey, rawValue)
    }
    return parseInt(rawValue, 10) / 100
  }
}
