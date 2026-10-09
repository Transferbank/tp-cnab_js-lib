import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab240BoletoNossoNumeroField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'nosso_numero'
  readonly range: [number, number] = [38, 57]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected extractRawValue(): string {
    const rawValue = super.extractRawValue()
    return /^0*$/.test(rawValue) ? '' : rawValue
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }
}
