import { FieldParser } from './field-parser'

export class DocumentParser implements FieldParser<string> {
  parse(raw: string): string {
    return raw.trim().replace(/^0+/, '')
  }
}
