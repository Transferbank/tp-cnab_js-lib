import { CnabBoleto } from '@/types/boleto/cnab-boleto'
import { CNABFormatCode } from '@/types/core/cnab'
import {
  CNABBoletoNotFoundError,
  CNABBoletoValidationError,
  CNABDocumentValidationError,
  CNABFieldValidationError
} from '@/types/errors/field-errors'

export interface BoletoRange {
  startLine: number
  endLine: number
}

export interface BoletoResult<T = unknown> {
  index: number
  success: boolean
  data?: Partial<T>
  errors?: (CNABFieldValidationError | CNABBoletoValidationError)[]
  error?: Error
}

export abstract class CnabDocument<TBoleto extends CnabBoleto = CnabBoleto> {
  abstract readonly type: CNABFormatCode

  protected readonly rawLines: string[]
  private readonly boletoRanges: BoletoRange[]
  private readonly _structureErrors: CNABDocumentValidationError[] = []

  constructor(rawLines: string[]) {
    this.rawLines = rawLines
    this.validateHeader()
    this.validateTrailer()
    this.boletoRanges = this.groupBoletos()
  }

  protected abstract validateHeader(): void
  protected abstract validateTrailer(): void
  protected abstract groupBoletos(): BoletoRange[]
  protected abstract get BoletoClass(): new (lines: string[]) => TBoleto

  protected throwDocError(reason: string, lineNumber?: number): never {
    throw new CNABDocumentValidationError(reason, lineNumber)
  }

  protected recordDocError(reason: string, lineNumber?: number): void {
    this._structureErrors.push(new CNABDocumentValidationError(reason, lineNumber))
  }

  get structureErrors(): CNABDocumentValidationError[] {
    return this._structureErrors
  }

  get hasStructureErrors(): boolean {
    return this._structureErrors.length > 0
  }

  get boletoCount(): number {
    return this.boletoRanges.length
  }

  getBoleto(index: number): TBoleto {
    const range = this.boletoRanges[index]
    if (range == null) {
      throw new CNABBoletoNotFoundError(index, this.boletoCount)
    }
    const lines = this.rawLines.slice(range.startLine, range.endLine)
    return new this.BoletoClass(lines)
  }

  private readBoletoResult(index: number): BoletoResult {
    try {
      const boleto = this.getBoleto(index)
      const readResult = boleto.read()

      const success = readResult.errors.length === 0
      return {
        index,
        success,
        data: readResult.data,
        errors: readResult.errors.length > 0 ? readResult.errors : undefined
      }
    } catch (error) {
      return { index, success: false, error: error as Error }
    }
  }

  read(start: number, end: number): BoletoResult[] {
    const from = Math.max(0, start)
    const to = Math.min(end, this.boletoCount)
    const results: BoletoResult[] = []
    for (let i = from; i < to; i++) {
      results.push(this.readBoletoResult(i))
    }
    return results
  }

  readAll(): BoletoResult[] {
    return this.read(0, this.boletoCount)
  }
}
