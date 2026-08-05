export interface FieldParser<T> {
  parse(raw: string): T
}
