export type CNABFormat = 'CNAB 240' | 'CNAB 400'


export enum CNABFormatCode {
  CNAB240 = 'CNAB240',
  CNAB400 = 'CNAB400'
}


export interface CNABRecord {
  name: string
  amount: number
  dueDate: string
  address: string
  document: string
}

export interface ValidationError {
  line: number
  field: string
  message: string
}

export interface ParsedField {
  raw: string
  value: string | number
  error: string | null
  canonical: import('../bank/bank-types').FieldDefinition['canonical']
  [key: string]: unknown
}

export interface ParsedLine {
  [fieldName: string]: ParsedField
}

export interface CNABValidationResult {
  isValid: boolean
  feedback: {
    type: CNABFormat
    bank: string
    lines: ValidationError[]
    records?: CNABRecord[]
  }
}
