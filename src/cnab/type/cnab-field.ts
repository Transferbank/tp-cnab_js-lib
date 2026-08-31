import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldEmptyValueError } from '@cnab/type/cnab-validation-error'

export abstract class CnabField<T = string> {
  static readonly fieldType: CnabFieldType
  static readonly isOptional: boolean = false
  abstract readonly fieldName: string
  // O range começa a partir de start + 1, seguindo as documentações dos arquivos cnab
  abstract readonly range: [number, number]

  protected readonly rawLine: string
  protected readonly lineNumber: number
  private cachedValue?: T | null

  constructor(rawLine: string, lineNumber: number) {
    this.rawLine = rawLine
    this.lineNumber = lineNumber
  }

  get value(): T | null {
    if (this.cachedValue === undefined) {
      try {
        // 1. Extrai o valor bruto da linha (sempre string)
        const rawValue = this.extractRawValue()

        // 2. Se vazio (não preenchido no arquivo) -> null
        if (rawValue === '') {
          this.cachedValue = null
        } else {
          // 3. Tem conteúdo -> parseia para o tipo correto
          this.cachedValue = this.parseValue(rawValue)
        }
      } catch (error) {
        const isOptional = (this.constructor as typeof CnabField).isOptional
        if (isOptional) {
          this.cachedValue = null
        } else {
          throw error
        }
      }
    }
    return this.cachedValue
  }

  protected extractRawValue(): string {
    return this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
  }

  validate(): CnabValidationResult {
    const isOptional = (this.constructor as typeof CnabField).isOptional
    if (isOptional && this.value === null) {
      return { isValid: true, errors: [] }
    }
    return this.performValidation()
  }

  abstract shouldValidate(): boolean
  protected abstract parseValue(rawValue: string): T
  protected abstract performValidation(): CnabValidationResult

  parse(): T {
    const rawValue = this.extractRawValue()
    if (rawValue === '') {
      throw new CnabFieldEmptyValueError(this.fieldName)
    }
    return this.parseValue(rawValue)
  }
}

export type CnabFieldClass = typeof CnabField<unknown>
