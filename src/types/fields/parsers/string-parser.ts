import { FieldParser } from './field-parser'

export class TrimParser implements FieldParser<string> {
  parse(raw: string): string {
    return raw.trim()
  }
}
