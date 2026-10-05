import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabFieldParseError,
  CnabGenericFieldError
} from '@cnab/type/cnab-validation-error'

export abstract class CnabField<T> {
  static readonly fieldType: CnabFieldType
  static readonly isOptional: boolean = false
  abstract readonly fieldKey: string
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

    // 1. Extrai o valor bruto da linha (sempre string)
    const rawValue = this.extractRawValue()

    // 2. Se vazio (não preenchido no arquivo) -> null
    if (rawValue === '') {
      this.cachedValue = null
    } else {
      // 3. Tem conteúdo -> parseia para o tipo correto
      this.cachedValue = this.parseValue(rawValue)
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
              message: `Campo ${this.fieldKey} com formato inválido: ${error.rawValue}`,
              lineNumber: this.lineNumber,
              fieldKey: this.fieldKey,
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

export interface CnabFieldClass<T = unknown> {
  readonly fieldType: CnabFieldType
  readonly isOptional: boolean
  new (rawLine: string, lineNumber: number): CnabField<T>
}

export function optional<T>(fieldClass: CnabFieldClass<T>): CnabFieldClass<T> {
  const fieldConstructor: new (rawLine: string, lineNumber: number) => object = fieldClass
  return class extends fieldConstructor {
    static readonly isOptional = true
  } as CnabFieldClass<T>
}
