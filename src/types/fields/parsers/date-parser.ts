import { FieldParser } from './field-parser'
import { parseDateDDMMAA } from '@utils/date-parser'

export class DateDDMMAAParser implements FieldParser<Date> {
  parse(raw: string): Date {
    const parsed = parseDateDDMMAA(raw)
    if (parsed == null) {
      throw new Error('data inválida')
    }
    return parsed
  }
}
