import { FieldParser } from './field-parser'

export class MoneyParser implements FieldParser<number> {
  constructor(private readonly decimalPlaces: number = 2) {
    if (decimalPlaces < 0) {
      throw new Error('decimalPlaces deve ser >= 0')
    }
  }

  parse(raw: string): number {
    return parseInt(raw, 10) / Math.pow(10, this.decimalPlaces)
  }
}
