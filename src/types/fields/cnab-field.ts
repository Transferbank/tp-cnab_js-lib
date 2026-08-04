import { CNABFieldValidationError, CNABBoletoValidationError } from '@/types/errors/field-errors'

export abstract class CnabField<T = string | number> {
  protected abstract readonly lineIndex: number
  protected abstract readonly pos: [number, number]
  protected abstract readonly description: string

  protected abstract validateStructure(lines: string[]): void

  protected extractRaw(lines: string[]): string {
    return lines[this.lineIndex].substring(this.pos[0], this.pos[1])
  }

  protected throwError(rawValue: string, reason: string): never {
    throw new CNABFieldValidationError(this.description, rawValue, reason)
  }

  protected throwStructureError(reason: string, lineNumber?: number): never {
    throw new CNABBoletoValidationError(reason, lineNumber)
  }

  abstract validate(raw: string): void
  abstract parse(raw: string): T

  read(lines: string[]): T {
    this.validateStructure(lines)
    const raw = this.extractRaw(lines)
    this.validate(raw)
    return this.parse(raw)
  }
}
