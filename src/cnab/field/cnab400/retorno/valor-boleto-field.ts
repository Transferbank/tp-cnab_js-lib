import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { blankIfZeros } from '@cnab/utils/phone-parser'
import { parseImpliedDecimal } from '@cnab/utils/value-parser'

export abstract class ValorBoletoField extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  protected readonly recordType: string = '1'

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine, this.recordType)
  }

  protected extractRawValue(): string {
    return blankIfZeros(super.extractRawValue())
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): number {
    const value = parseImpliedDecimal(rawValue, 2)
    if (value == null) {
      throw new CnabFieldInvalidNumberError(this.fieldKey, rawValue)
    }
    return value
  }
}
