import { CnabLineSchema } from './cnab-line-schema'
import { CnabField } from './cnab-field'
import { CnabValidationResult } from './cnab-validation-result'

export class CnabSchema {
  constructor(
    public readonly header: CnabLineSchema,
    public readonly trailer: CnabLineSchema,
    public readonly boleto: CnabLineSchema
  ) {}

  validate(_lines: string[], _isEager: boolean, _extraFields?: CnabField[]): CnabValidationResult {
    // TODO: Implementar lógica de validação
    return {
      isValid: true,
      errors: []
    }
  }
}
