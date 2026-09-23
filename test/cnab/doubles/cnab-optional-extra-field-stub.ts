import { CnabField } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'

// Representa um campo opcional que não faz parte do schema de nenhum banco,
// simulando o cenário de um consumidor da lib adicionando validação extra
// via extraFields.
export class CnabOptionalExtraFieldStub extends CnabField<number> {
  static readonly fieldType = CnabFieldType.BOLETO
  static readonly isOptional = true

  readonly fieldName = 'campo extra de teste'
  readonly range: [number, number] = [118, 123]

  shouldValidate(): boolean {
    return Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): number {
    if (!/^\d+$/.test(rawValue)) {
      throw new CnabFieldInvalidNumberError(this.fieldName, rawValue)
    }
    return parseInt(rawValue, 10)
  }
}
