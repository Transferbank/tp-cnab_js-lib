import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'

export abstract class CnabField {
  static readonly fieldType: CnabFieldType
  static readonly isOptional: boolean = false
  abstract readonly fieldName: string
  // O range começa a partir de start + 1, seguindo as documentações dos arquivos cnab
  abstract readonly range: [number, number]

  protected readonly rawLine: string
  protected readonly lineNumber: number
  private cachedValue?: unknown | null

  constructor(config: { rawLine: string; lineNumber: number }) {
    this.rawLine = config.rawLine
    this.lineNumber = config.lineNumber
  }

  get value(): unknown | null {
    if (this.cachedValue === undefined) {
      try {
        const parsed = this.parse()
        this.cachedValue = parsed === '' ? null : parsed
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

  static shouldValidate(_rawLine: string): boolean {
    throw new Error('shouldValidate must be implemented by subclass')
  }

  validate(): CnabValidationResult {
    const isOptional = (this.constructor as typeof CnabField).isOptional
    if (isOptional && this.value === null) {
      return { isValid: true, errors: [] }
    }
    return this.validateInternal()
  }

  /**
   * Extrai o valor do campo a partir da rawLine usando o range definido.
   * O range usa índice 1-based (primeiro caractere é posição 1), então subtraímos 1.
   * Remove espaços em branco do início e fim.
   */
  protected getRangeValue(): string {
    return this.rawLine.substring(this.range[0] - 1, this.range[1]).trim()
  }

  protected abstract validateInternal(): CnabValidationResult
  abstract parse(): string
}
