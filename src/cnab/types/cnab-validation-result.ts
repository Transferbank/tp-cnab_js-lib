import { CnabValidationError } from './cnab-validation-error'

export interface CnabValidationResult {
  isValid: boolean
  errors: CnabValidationError[]
}
