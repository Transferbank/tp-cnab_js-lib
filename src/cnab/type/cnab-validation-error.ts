export enum CnabValidationErrorType {
  LINE = 'line',
  FIELD = 'field'
}

export interface CnabValidationError {
  message: string
  errorType: CnabValidationErrorType
  lineNumber: number
  fieldName?: string
  range?: [number, number]
}