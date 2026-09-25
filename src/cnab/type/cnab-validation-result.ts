import { CnabValidationError } from '@cnab/type/cnab-validation-error'

export interface CnabValidationResult {
  isValid: boolean
  errors: CnabValidationError[]
}
