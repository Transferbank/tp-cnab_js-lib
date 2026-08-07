import { FieldParser } from './field-parser'
import { parseDateDDMMAAAA } from '@utils/date-parser'

export class DateDDMMAAAAParser implements FieldParser<Date> {
  parse(raw: string): Date {
    const parsed = parseDateDDMMAAAA(raw)
    if (parsed == null) {
      throw new Error('data inválida')
    }
    return parsed
  }
}
