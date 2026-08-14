import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'

export abstract class CnabField {
  static readonly fieldType: CnabFieldType
  static readonly fieldName: string
  static readonly range: [number, number]

  protected readonly rawLine: string
  protected readonly lineNumber: number

  constructor(config: { rawLine: string; lineNumber: number }) {
    this.rawLine = config.rawLine
    this.lineNumber = config.lineNumber
  }

  protected get fieldType(): CnabFieldType {
    return (this.constructor as typeof CnabField).fieldType
  }

  protected get fieldName(): string {
    return (this.constructor as typeof CnabField).fieldName
  }

  protected get range(): [number, number] {
    return (this.constructor as typeof CnabField).range
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
