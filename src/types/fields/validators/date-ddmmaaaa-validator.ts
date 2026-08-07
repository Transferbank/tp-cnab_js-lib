import { FieldValidator } from './field-validator'
import { parseDateDDMMAAAA } from '@utils/date-parser'

export class DateDDMMAAAAValidator implements FieldValidator {
  readonly errorMessage = 'data inválida ou em formato incorreto (esperado DDMMAAAA)'

  validate(raw: string): boolean {
    const trimmed = raw.trim()
    
    if (trimmed.length === 0) return false
    if (!/^\d{8}$/.test(trimmed)) return false
    
    const parsed = parseDateDDMMAAAA(trimmed)
    return parsed != null
  }
}
