import { CnabFormat } from './cnab-format'
import { CnabBankCode } from './cnab-bank-code'
import { CnabFieldType } from './cnab-field-type'
import { CnabField } from './cnab-field'
import { CnabValidationResult } from './cnab-validation-result'

export class CnabLineSchema {
  constructor(
    public readonly format: CnabFormat,
    public readonly bankCode: CnabBankCode,
    public readonly fieldType: CnabFieldType,
    public readonly fields: (new () => CnabField)[]
  ) {}

  validate(
    _rawLines: string[],
    _isEager: boolean,
    _extraFields: CnabField[],
    _firstLine: number
  ): CnabValidationResult {
    // TODO: Implementar lógica de validação
    return {
      isValid: true,
      errors: []
    }
  }
}
