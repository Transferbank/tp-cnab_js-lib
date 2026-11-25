import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabFieldParseError,
  CnabGenericFieldError
} from '@cnab/type/cnab-validation-error'

export type CnabNumberedLine = [number, string]

export abstract class CnabField<T> {
  static readonly fieldType: CnabFieldType
  static readonly isOptional: boolean = false
  static readonly dependencies: CnabFieldClass[] = []
  static readonly bank?: CnabBank
  static readonly format?: CnabFormat

  static get validatesInGroup(): boolean {
    return this.dependencies.length > 0
  }

  abstract readonly fieldKey: string
  // O range começa a partir de start + 1, seguindo as documentações dos arquivos cnab
  abstract readonly range: [number, number]

  protected readonly rawLine: string
  protected readonly lineNumber: number
  protected readonly dispensingField: CnabFieldClass<string> | null = null
  protected readonly dispensingValues: string[] = []
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

  validateInGroup(group: CnabNumberedLine[]): CnabValidationResult {
    if (this.isDispensedInGroup(group)) {
      return { isValid: true, errors: [] }
    }
    return this.validate()
  }

  readInGroup(group: CnabNumberedLine[]): T | null {
    if (this.isDispensedInGroup(group)) {
      return null
    }
    return this.value
  }

  protected isDispensedBy(value: string): boolean {
    return this.dispensingValues.includes(value)
  }

  private isDispensedInGroup(group: CnabNumberedLine[]): boolean {
    if (this.dispensingField == null) {
      return false
    }
    const value = this.groupValue(group, this.dispensingField)
    return value != null && this.isDispensedBy(value)
  }

  handleDuplicatedValue(_previousValue: unknown): T | null {
    return this.value
  }

  protected groupValue<V>(group: CnabNumberedLine[], fieldClass: CnabFieldClass<V>): V | null {
    let value: V | null = null
    for (const [lineNumber, rawLine] of group) {
      const field = new fieldClass(rawLine, lineNumber)
      if (!field.shouldValidate()) {
        continue
      }
      const lineValue = readableValue(field)
      if (lineValue == null) {
        continue
      }
      value = value == null ? lineValue : field.handleDuplicatedValue(value)
    }
    return value
  }

  abstract shouldValidate(): boolean
  protected abstract parseValue(rawValue: string): T
  protected abstract performValidation(): CnabValidationResult
}

function readableValue<V>(field: CnabField<V>): V | null {
  try {
    return field.value
  } catch (error) {
    if (error instanceof CnabFieldParseError) {
      return null
    }
    throw error
  }
}

export interface CnabFieldClass<T = unknown> {
  readonly fieldType: CnabFieldType
  readonly isOptional: boolean
  readonly dependencies: CnabFieldClass[]
  readonly validatesInGroup: boolean
  readonly bank?: CnabBank
  readonly format?: CnabFormat
  new (rawLine: string, lineNumber: number): CnabField<T>
}

export function optional<T>(fieldClass: CnabFieldClass<T>): CnabFieldClass<T> {
  const fieldConstructor: new (rawLine: string, lineNumber: number) => object = fieldClass
  return class extends fieldConstructor {
    static readonly isOptional = true
  } as CnabFieldClass<T>
}
