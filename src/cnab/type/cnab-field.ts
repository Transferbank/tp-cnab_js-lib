import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'

export abstract class CnabField {
  static readonly fieldType: CnabFieldType
  abstract readonly fieldName: string
  abstract readonly range: [number, number]

  protected readonly rawLine: string
  protected readonly lineNumber: number

  constructor(config: { rawLine: string; lineNumber: number }) {
    this.rawLine = config.rawLine
    this.lineNumber = config.lineNumber
  }

  static shouldValidate(_rawLine: string): boolean {
    return false
  }

  protected getRangeValue(): string {
    return this.rawLine.substring(...this.range)
  }

  abstract validate(): CnabValidationResult
  abstract parse(): string
}