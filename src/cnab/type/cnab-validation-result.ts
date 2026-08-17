import { createCnabValidationError } from './cnab-validation-error'

export interface CnabValidationResult {
  isValid: boolean
  errors: createCnabValidationError[]
}