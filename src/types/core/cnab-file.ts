import { CNABFormatCode, CNABValidationResult, ParsedLine, ValidationError, CNABRecord } from '@/types/core/core-types'
import { Cnab240SegmentCode, Cnab240RecordType } from '@tp-types/cnab240-record-types'
import { Cnab400RecordType } from '@tp-types/cnab400-record-types'
import { ReadMode } from '@/types/core/read-mode'
import type { ReadOptions, ReadAsyncOptions } from '@/types/core/read-options'
import type { CNABReadResult } from '@/types/core/read-result'
import type { LazyBillItem } from '@/types/core/lazy-bill'
import { BankSchema, RecordSchema, CNABProvider, OptionalRecordSchema } from '@/types/bank/bank-types'
import { CNABError, CNABGroupingError, CNABLazyResolveError } from '@/types/errors/error-types'
import { validateCnab240Content } from '@validators/cnab240-content-validator'
import { validateCnab400Content } from '@validators/cnab400-content-validator'
import { validateCnab240Structure } from '@validators/cnab240-structure-validator'
import { validateCnab400Structure } from '@validators/cnab400-structure-validator'
import { mergeValidationErrors } from '@validators/merge-validation-errors'
import { buildOptionalMap } from '@validators/build-optional-map'
import { extractLineFields } from '@parser/field-extractor'
import { getCnab400RecordType, getCnab240RecordType, getCnab240SegmentCode } from '@parser/position-reader'
import { getCnab240SegmentYVariant } from '@parser/cnab-positions'
import type { CNABData } from '@/types/read/read-types'
import type { BillGroup } from '@/types/processing/grouping'
import { ValidationResult } from '@/validators/types'
import type { getProvider as GetProviderType } from '@/provider/catalog'

let cachedGetProvider: typeof GetProviderType | undefined

export class CNABFile {
  public readonly type: CNABFormatCode
  private readonly bankSchema: BankSchema
  private readonly rawLines: string[]

  constructor(
    type: CNABFormatCode,
    bankSchema: BankSchema,
    rawLines: string[]
  ) {
    this.type = type
    this.bankSchema = bankSchema
    this.rawLines = rawLines
  }

  get lineCount(): number {
    return this.rawLines.length
  }

  get bankCode(): string {
    return this.bankSchema.bankCode
  }

  get bankName(): string {
    return this.bankSchema.bankName
  }

  getRawLines(): readonly string[] {
    return this.rawLines
  }

  toString(): string {
    const formatLabel = this.type === CNABFormatCode.CNAB240 ? 'CNAB 240' : 'CNAB 400'
    return `CNABFile { type: ${formatLabel}, bank: ${this.bankName} (${this.bankCode}), lines: ${this.lineCount} }`
  }

  private async resolveProvider(mode: ReadMode): Promise<CNABProvider> {
    if (cachedGetProvider == null) {
      const module = await import('@/provider/catalog')
      cachedGetProvider = module.getProvider
    }
    return cachedGetProvider(this.bankCode, this.type, mode)
  }

  async validate(): Promise<boolean>
  async validate(withFeedback: false): Promise<boolean>
  async validate(withFeedback: true): Promise<CNABValidationResult>
  async validate(withFeedback?: boolean): Promise<boolean | CNABValidationResult> {
    const provider = await this.resolveProvider(ReadMode.SIMPLE)
    const bankSchema = provider.schema

    if (withFeedback !== true) {
      const result = this.validateFailFast(bankSchema)
      return result.isValid
    }

    return this.validateWithFullFeedback(bankSchema)
  }

  private validateFailFast(bankSchema: BankSchema): CNABValidationResult {
    const structureResult = this.runStructureValidation(bankSchema, true)
    if (structureResult.errors.length > 0) {
      return this.buildValidationResult(false, [structureResult.errors[0]])
    }

    const contentResult = this.runContentValidation(bankSchema, true)
    if (contentResult.errors.length > 0) {
      return this.buildValidationResult(false, [contentResult.errors[0]])
    }

    return this.buildValidationResult(true, [])
  }

  private validateWithFullFeedback(bankSchema: BankSchema): CNABValidationResult {
    const structureResult = this.runStructureValidation(bankSchema)
    const contentResult = this.runContentValidation(bankSchema)
    const errors = mergeValidationErrors(structureResult.errors, contentResult.errors)

    return this.buildValidationResult(errors.length === 0, errors, contentResult.records)
  }

  private runStructureValidation(bankSchema: BankSchema, failFast = false): { errors: ValidationError[] } {
    return this.type === CNABFormatCode.CNAB240
      ? validateCnab240Structure(this.rawLines, bankSchema, failFast)
      : validateCnab400Structure(this.rawLines, bankSchema, failFast)
  }

  private runContentValidation(bankSchema: BankSchema, failFast = false): ValidationResult {
    return this.type === CNABFormatCode.CNAB240
      ? validateCnab240Content(this.rawLines, bankSchema, failFast)
      : validateCnab400Content(this.rawLines, bankSchema, failFast)
  }

  private buildValidationResult(
    isValid: boolean,
    errors: ValidationError[],
    records?: CNABRecord[]
  ): CNABValidationResult {
    const formatLabel = this.type === CNABFormatCode.CNAB240 ? 'CNAB 240' : 'CNAB 400'
    
    return {
      isValid,
      feedback: {
        type: formatLabel,
        bank: this.bankName,
        lines: errors,
        ...(records && { records }),
      },
    }
  }

  private getHeaderTrailerSchemas(bankSchema: BankSchema): {
    headerSchema: RecordSchema | undefined
    trailerSchema: RecordSchema | undefined
  } {
    return {
      headerSchema: this.type === CNABFormatCode.CNAB240 ? bankSchema.headerArquivo : bankSchema.header,
      trailerSchema: this.type === CNABFormatCode.CNAB240 ? bankSchema.trailerArquivo : bankSchema.trailer,
    }
  }

  private parseBodyLine(
    line: string, 
    bankSchema: BankSchema,
    optionalMap: Map<string, OptionalRecordSchema>
  ): ParsedLine {
    if (this.type === CNABFormatCode.CNAB400) {
      return this.parseCnab400Line(line, bankSchema, optionalMap)
    } else {
      return this.parseCnab240Line(line, bankSchema, optionalMap)
    }
  }

  private parseCnab400Line(
    line: string, 
    bankSchema: BankSchema,
    optionalMap: Map<string, OptionalRecordSchema>
  ): ParsedLine {
    const recordType = getCnab400RecordType(line)
    
    if (recordType === Cnab400RecordType.DETAIL_STANDARD || recordType === Cnab400RecordType.DETAIL_BB) {
      return extractLineFields(line, bankSchema.detail!)
    }
    
    const optional = optionalMap.get(recordType)
    if (optional != null) {
      return extractLineFields(line, optional.schema)
    }
    
    // Suporte para identificadores compostos (ex: '5-99' do BB)
    for (const [identifier, opt] of optionalMap.entries()) {
      if (identifier.includes('-') && identifier.startsWith(recordType)) {
        return extractLineFields(line, opt.schema)
      }
    }
    
    return extractLineFields(line, bankSchema.detail!)
  }


  private parseCnab240Line(
    line: string, 
    bankSchema: BankSchema,
    optionalMap: Map<string, OptionalRecordSchema>
  ): ParsedLine {
    const recordType = getCnab240RecordType(line)
    
    if (recordType === Cnab240RecordType.DETALHE) {
      const segment = getCnab240SegmentCode(line)
      
      if (segment === Cnab240SegmentCode.P) {
        return extractLineFields(line, bankSchema.segmentoP!)
      } 
      else if (segment === Cnab240SegmentCode.Q) {
        return extractLineFields(line, bankSchema.segmentoQ!)
      } 
      else if (segment === Cnab240SegmentCode.R) {
        const optR = optionalMap.get(Cnab240SegmentCode.R)
        if (optR != null) {
          return extractLineFields(line, optR.schema)
        }
      } 
      else if (segment === Cnab240SegmentCode.S) {
        const optS = optionalMap.get(Cnab240SegmentCode.S)
        if (optS != null) {
          return extractLineFields(line, optS.schema)
        }
      } 
      else if (segment === Cnab240SegmentCode.Y) {
        const subVariant = getCnab240SegmentYVariant(line)
        const optY = optionalMap.get(`${Cnab240SegmentCode.Y}${subVariant}`)
        if (optY != null) {
          return extractLineFields(line, optY.schema)
        }
      }
    }
    
    return extractLineFields(line, bankSchema.segmentoP!)
  }

  private parseFile(bankSchema: BankSchema): {
    headerParsed: ParsedLine | undefined
    trailerParsed: ParsedLine | undefined
    bodyParsed: ParsedLine[]
  } {
    const headerLine = this.rawLines[0]
    const trailerLine = this.rawLines[this.rawLines.length - 1]
    const bodyLines = this.rawLines.slice(1, -1)

    const { headerSchema, trailerSchema } = this.getHeaderTrailerSchemas(bankSchema)
    
    const headerParsed = headerSchema ? extractLineFields(headerLine, headerSchema) : undefined
    const trailerParsed = trailerSchema ? extractLineFields(trailerLine, trailerSchema) : undefined

    const optionalMap = buildOptionalMap(bankSchema)
    const bodyParsed = bodyLines.map((line) => this.parseBodyLine(line, bankSchema, optionalMap))

    return { headerParsed, trailerParsed, bodyParsed }
  }


  async read(options: ReadOptions & { lazy: true }): Promise<CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>>>

  async read(options?: ReadOptions): Promise<CNABReadResult<CNABData | Record<string, unknown>>>

  async read(options?: ReadOptions): Promise<CNABReadResult<CNABData | Record<string, unknown>> | CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>>> {
    const mode = options?.mode ?? ReadMode.SIMPLE
    const lazy = options?.lazy ?? false

    const provider = await this.resolveProvider(mode)
    const bankSchema = provider.schema

    const { headerParsed, trailerParsed, bodyParsed } = this.parseFile(bankSchema)

    const { groups, errors: groupingErrors } = provider.group(bodyParsed)

    if (groupingErrors.length > 0) {
      const firstError = groupingErrors[0]
      throw new CNABGroupingError(firstError)
    }

    const header = provider.extractHeader(headerParsed)
    const trailer = provider.extractTrailer(trailerParsed)
    
    const paginatedGroups = options?.page
      ? groups.slice(options.page.start, options.page.start + options.page.size)
      : groups
    
    if (lazy) {
      const lazyBills = paginatedGroups.map((group: BillGroup) => ({
        startLine: group.startLine,
        resolve: (): Promise<CNABData | Record<string, unknown>> => {
          try {
            const result = mode === ReadMode.FULL ? provider.extractBillFull(group) : provider.extractBill(group)
            return Promise.resolve(result)
          } catch (error) {
            if (error instanceof CNABError) return Promise.reject(error)
            return Promise.reject(new CNABLazyResolveError(group.startLine, error))
          }
        },
      }))

      return {
        header,
        trailer,
        bills: lazyBills,
      }
    }

    const bills = paginatedGroups.map((group: BillGroup) =>
      mode === ReadMode.FULL ? provider.extractBillFull(group) : provider.extractBill(group)
    )

    return {
      header,
      trailer,
      bills,
    }
  }

  /**
   * Método readAsync não faz processamento verdadeiramente assíncrono.
   * Todo o trabalho pesado (parse, grouping, extraction) é síncrono e bloqueia a thread.
   * O batchSize/onProgress apenas dispara callbacks, mas não particiona o trabalho real.
   * 
   * Este método será removido ou reimplementado com processamento verdadeiramente
   * assíncrono em uma versão futura.
   */
  async readAsync(options: ReadAsyncOptions & { lazy: true }): Promise<CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>>>

  /**
   * @deprecated Ver sobrecarga acima para detalhes sobre as limitações deste método.
   */
  async readAsync(options?: ReadAsyncOptions): Promise<CNABReadResult<CNABData | Record<string, unknown>>>

  async readAsync(options?: ReadAsyncOptions): Promise<CNABReadResult<CNABData | Record<string, unknown>> | CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>>> {
    const batchSize = options?.batchSize ?? 100
    const onProgress = options?.onProgress
    const mode = options?.mode ?? ReadMode.SIMPLE
    const lazy = options?.lazy ?? false

    const provider = await this.resolveProvider(mode)
    const bankSchema = provider.schema

    const { headerParsed, trailerParsed, bodyParsed } = this.parseFile(bankSchema)

    const { groups, errors: groupingErrors } = provider.group(bodyParsed)

    if (groupingErrors.length > 0) {
      const firstError = groupingErrors[0]
      throw new CNABGroupingError(firstError)
    }

    const header = provider.extractHeader(headerParsed)
    const trailer = provider.extractTrailer(trailerParsed)
    
    const paginatedGroups = options?.page
      ? groups.slice(options.page.start, options.page.start + options.page.size)
      : groups
    
    const totalBills = paginatedGroups.length
    
    for (let i = 0; i < totalBills; i++) {
      if (onProgress && (i + 1) % batchSize === 0) {
        onProgress({ current: i + 1, total: totalBills })
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }
    
    if (onProgress && totalBills % batchSize !== 0) {
      onProgress({ current: totalBills, total: totalBills })
    }

    if (lazy) {
      const lazyBills = paginatedGroups.map((group: BillGroup) => ({
        startLine: group.startLine,
        resolve: (): Promise<CNABData | Record<string, unknown>> => {
          try {
            const result = mode === ReadMode.FULL ? provider.extractBillFull(group) : provider.extractBill(group)
            return Promise.resolve(result)
          } catch (error) {
            if (error instanceof CNABError) return Promise.reject(error)
            return Promise.reject(new CNABLazyResolveError(group.startLine, error))
          }
        },
      }))

      return {
        header,
        trailer,
        bills: lazyBills,
      }
    }

    const bills = paginatedGroups.map((group: BillGroup) =>
      mode === ReadMode.FULL ? provider.extractBillFull(group) : provider.extractBill(group)
    )

    return {
      header,
      trailer,
      bills,
    }
  }
}

