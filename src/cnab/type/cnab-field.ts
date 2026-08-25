import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'

export abstract class CnabField {
  static readonly fieldType: CnabFieldType
  static readonly isOptional: boolean = false
  abstract readonly fieldName: string
  abstract readonly range: [number, number]

  protected readonly rawLine: string
  protected readonly lineNumber: number
  private cachedValue?: unknown | null

  constructor(rawLine: string, lineNumber: number) {
    this.rawLine = rawLine
    this.lineNumber = lineNumber
  }

  get value(): unknown | null {
    if (this.cachedValue !== undefined) {
      return this.cachedValue
    }

    try {
      const parsed = this.parse()
      this.cachedValue = parsed === '' ? null : parsed
    } catch (error) {
      const isOptional = (this.constructor as typeof CnabField).isOptional
      if (!isOptional) throw error
      this.cachedValue = null
    }

    return this.cachedValue
  }

  abstract shouldValidate(): boolean

  validate(): CnabValidationResult {
    const isOptional = (this.constructor as typeof CnabField).isOptional
    if (isOptional && this.value == null) {
      return { isValid: true, errors: [] }
    }
    return this.performValidation()
  }

  protected abstract performValidation(): CnabValidationResult
  abstract parse(): string
}

export type CnabFieldClass = typeof CnabField
