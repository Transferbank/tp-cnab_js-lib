import { CnabValidationErrorType } from './cnab-validation-error-type'

export interface CnabValidationError {
  message: string
  errorType: CnabValidationErrorType
  lineNumber: number
  fieldName?: string
  range?: [number, number]
}