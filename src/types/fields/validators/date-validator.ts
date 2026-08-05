import { FieldValidator } from './field-validator'
import { parseDateDDMMAA } from '@utils/date-parser'

export class DateDDMMAAValidator implements FieldValidator {
  readonly errorMessage = 'data inválida ou em formato incorreto (esperado DDMMAA)'

  validate(raw: string): boolean {
    const trimmed = raw.trim()
    
    if (trimmed.length === 0) return false
    if (!/^\d{6}$/.test(trimmed)) return false
    
    const parsed = parseDateDDMMAA(trimmed)
    return parsed != null
  }
}
