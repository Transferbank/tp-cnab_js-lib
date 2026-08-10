import { CNABFieldValidationError } from '@/types/errors/field-errors'
import type { FieldValidator } from './validators/field-validator'
import type { FieldParser } from './parsers/field-parser'

export abstract class CnabField<T = string | number> {
  protected abstract readonly lineIndex: number
  protected abstract readonly pos: [number, number]
  protected abstract readonly description: string
  protected abstract readonly validator: FieldValidator
  protected abstract readonly parser: FieldParser<T>
  protected abstract readonly key: string

  get fieldKey(): string {
    return this.key
  }

  get fieldDescription(): string {
    return this.description
  }

  protected extractRaw(lines: string[], lineOffset: number): string {
    const line = lines[this.lineIndex]

    if (line == null) {
      this.throwError('', `linha ${this.lineIndex} não encontrada no array fornecido`, lineOffset)
    }

    return line.substring(this.pos[0], this.pos[1])
  }

  protected throwError(rawValue: string, reason: string, lineOffset: number = 0): never {
    throw new CNABFieldValidationError(this.description, rawValue, reason, this.lineIndex + lineOffset)
  }

  protected validate(raw: string, lineOffset: number): void {
    if (!this.validator.validate(raw)) {
      this.throwError(raw, this.validator.errorMessage, lineOffset)
    }
  }

  protected parse(raw: string): T {
    return this.parser.parse(raw)
  }

  read(lines: string[], lineOffset: number = 0): T {
    const raw = this.extractRaw(lines, lineOffset)
    this.validate(raw, lineOffset)
    return this.parse(raw)
  }
}
