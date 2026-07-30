import { ValidationError, CNABRecord } from '@tp-types/index'

export interface ValidationResult {
  errors: ValidationError[]
  records: CNABRecord[]
}
