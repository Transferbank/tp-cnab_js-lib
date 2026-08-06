import { CNABFieldValidationError } from '@/types/errors/field-errors'
import type { FieldValidator } from './validators/field-validator'
import type { FieldParser } from './parsers/field-parser'

export abstract class CnabField<T = string | number> {
  protected abstract readonly lineIndex: number
  protected abstract readonly pos: [number, number]
  protected abstract readonly description: string
  protected abstract readonly validator: FieldValidator
  protected abstract readonly parser: FieldParser<T>
  protected readonly key?: string

  protected extractRaw(lines: string[]): string {
    const line = lines[this.lineIndex]
    
    if (line == null) {
      this.throwError('', `linha ${this.lineIndex} não encontrada no array fornecido`)
    }
    
    return line.substring(this.pos[0], this.pos[1])
  }

  protected throwError(rawValue: string, reason: string): never {
    throw new CNABFieldValidationError(this.description, rawValue, reason)
  }

  protected validate(raw: string): void {
    if (!this.validator.validate(raw)) {
      this.throwError(raw, this.validator.errorMessage)
    }
  }

  protected parse(raw: string): T {
    return this.parser.parse(raw)
  }

  read(lines: string[]): T {
    const raw = this.extractRaw(lines)
    this.validate(raw)
    return this.parse(raw)
  }
}
