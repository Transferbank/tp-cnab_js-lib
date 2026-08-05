import { FieldValidator } from './field-validator'

export class NumericValidator implements FieldValidator {
  readonly errorMessage = 'deve conter apenas dígitos e não pode estar vazio'

  validate(raw: string): boolean {
    const trimmed = raw.trim()
    
    if (trimmed.length === 0) return false
    if (!/^\d+$/.test(trimmed)) return false
    
    return true
  }
}
