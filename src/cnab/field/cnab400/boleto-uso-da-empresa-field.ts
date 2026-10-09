import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

export class Cnab400BoletoUsoDaEmpresaField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'uso_da_empresa'
  protected readonly recordType: string = '1'
  readonly range: [number, number] = [38, 62]

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
