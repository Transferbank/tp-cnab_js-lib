import { FieldParser } from './field-parser'

export class DocumentParser implements FieldParser<string> {
  parse(raw: string): string {
    const cleaned = raw.trim().replace(/^0+/, '')
    return cleaned.length <= 11 ? cleaned.padStart(11, '0') : cleaned.padStart(14, '0')
  }
}
