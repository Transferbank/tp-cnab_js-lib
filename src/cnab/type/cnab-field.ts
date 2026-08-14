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

  protected getFieldValue(): string {
    const [start, end] = this.range
    return this.rawLine.substring(start, end)
  }

  static shouldValidate(_rawLine: string): boolean {
    return false
  }

  abstract validate(): CnabValidationResult
  abstract parse(): string
}
