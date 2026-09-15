import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabFieldParseError,
  CnabFieldUnexpectedParseError,
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

    // Vazio (não preenchido no arquivo) -> null. Conteúdo malformado
    // sempre propaga - opcional significa "pode estar em branco", não
    // "pode conter lixo". Qualquer erro que não seja já um
    // CnabFieldParseError é normalizado como tal, para que validate()
    // sempre saiba reconhecer um erro de parse independente de como a
    // classe concreta de parseValue() o lançou.
    const rawValue = this.extractRawValue()

    if (rawValue === '') {
      this.cachedValue = null
    } else {
      try {
        this.cachedValue = this.parseValue(rawValue)
      } catch (error) {
        if (error instanceof CnabFieldParseError) {
          throw error
        }
        throw new CnabFieldUnexpectedParseError(this.fieldName, rawValue, error)
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
    const isOptional = (this.constructor as typeof CnabField).isOptional

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

export interface CnabFieldClass<T = unknown> {
  readonly fieldType: CnabFieldType
  readonly isOptional: boolean
  new (rawLine: string, lineNumber: number): CnabField<T>
}
