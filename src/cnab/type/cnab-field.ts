import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabFieldParseError,
  CnabGenericFieldError
} from '@cnab/type/cnab-validation-error'

export abstract class CnabField<T> {
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
    if (this.cachedValue !== undefined) {
      return this.cachedValue
    }

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
      const isOptional = (this.constructor as typeof CnabField<T>).isOptional
      if (isOptional) {
        this.cachedValue = null
      } else {
        throw error
      }
    }

    return this.cachedValue
  }

  protected extractRawValue(): string {
    return this.extractRangeFromLine(this.range[0] - 1, this.range[1])
  }

  protected extractRangeFromLine(start: number, end: number): string {
    if (start < 0 || end <= start) {
      throw new RangeError(`extractRangeFromLine: intervalo invalido (start=${start}, end=${end})`)
    }
    return this.rawLine.substring(start, end).trim()
  }

  validate(): CnabValidationResult {
    const isOptional = (this.constructor as typeof CnabField<T>).isOptional

    let value: T | null
    try {
      value = this.value
    } catch (error) {
      if (error instanceof CnabFieldParseError) {
        return {
          isValid: false,
          errors: [
            new CnabGenericFieldError({
              message: `Campo ${this.fieldName} com formato inválido: ${error.rawValue}`,
              lineNumber: this.lineNumber,
              fieldName: this.fieldName,
              range: this.range
            })
          ]
        }
      }
      throw error
    }

    if (isOptional && value == null) {
      return { isValid: true, errors: [] }
    }
    return this.performValidation()
  }

  abstract shouldValidate(): boolean
  protected abstract parseValue(rawValue: string): T
  protected abstract performValidation(): CnabValidationResult
}

export type CnabFieldClass = typeof CnabField<unknown>
