import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BoletoSeuNumeroField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'seu_numero'
  protected readonly recordType: string = '1'
  readonly range: [number, number] = [111, 120]

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
