import { ValidationError, CNABRecord } from '@/types/all-types'

export interface ValidationResult {
  errors: ValidationError[]
  records: CNABRecord[]
}
