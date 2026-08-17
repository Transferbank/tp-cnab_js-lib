export enum CnabValidationErrorType {
  LINE = 'line',
  FIELD = 'field'
}

export interface createCnabValidationError {
  message: string
  errorType: CnabValidationErrorType
  lineNumber: number
  fieldName?: string
  range?: [number, number]
}

export function createCnabValidationError(params: {
  message: string
  errorType: CnabValidationErrorType
  lineNumber: number
  fieldName?: string
  range?: [number, number]
}): createCnabValidationError {
  return {
    message: params.message,
    errorType: params.errorType,
    lineNumber: params.lineNumber,
    fieldName: params.fieldName,
    range: params.range
  }
}