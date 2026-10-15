import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

export abstract class IdentificacaoBoletoField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  protected readonly segment: string = 'T'

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmento(this.rawLine, this.segment)
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }
}
