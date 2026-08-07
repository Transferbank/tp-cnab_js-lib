import { CnabBoleto } from '@/types/boleto/cnab-boleto'
import { CNABFormatCode } from '@/types/core/cnab'
import {
  CNABBoletoNotFoundError,
  CNABDocumentValidationError
} from '@/types/errors/field-errors'

export interface BoletoRange {
  startLine: number
  endLine: number
}

export interface BoletoResult<T = unknown> {
  index: number
  success: boolean
  data?: T
  error?: Error
}

export abstract class CnabDocument<TBoleto extends CnabBoleto = CnabBoleto> {
  abstract readonly type: CNABFormatCode

  protected readonly rawLines: string[]
  private readonly boletoRanges: BoletoRange[]

  constructor(
    rawLines: string[],
    private readonly BoletoClass: new (lines: string[]) => TBoleto
  ) {
    this.rawLines = rawLines
    this.validateHeader()
    this.validateTrailer()
    this.boletoRanges = this.groupBoletos()
  }

  protected abstract validateHeader(): void
  protected abstract validateTrailer(): void
  protected abstract groupBoletos(): BoletoRange[]

  protected throwDocError(reason: string, lineNumber?: number): never {
    throw new CNABDocumentValidationError(reason, lineNumber)
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

  readAll(): BoletoResult[] {
    const results: BoletoResult[] = []
    for (let i = 0; i < this.boletoCount; i++) {
      try {
        const data = this.getBoleto(i).read()
        results.push({ index: i, success: true, data })
      } catch (error) {
        results.push({ index: i, success: false, error: error as Error })
      }
    }
    return results
  }
}
