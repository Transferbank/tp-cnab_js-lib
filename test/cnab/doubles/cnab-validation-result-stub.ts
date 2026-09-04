import { CnabValidationResult } from '@cnab/type/cnab-validation-result'

export function genValidCnabValidationResult(): CnabValidationResult {
  return {
    isValid: true,
    errors: []
  }
}
