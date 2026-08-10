import { FieldParser } from './field-parser'

export class MoneyParser implements FieldParser<number> {
  private readonly divisor: number

  constructor(decimalPlaces: number = 2) {
    if (decimalPlaces < 0) {
      throw new Error('decimalPlaces deve ser >= 0')
    }
    this.divisor = Math.pow(10, decimalPlaces)
  }

  parse(raw: string): number {
    return parseInt(raw, 10) / this.divisor
  }
}
