import { CNABFormatCode, CNABValidationResult, ParsedLine, ValidationError, CNABRecord } from './cnab'
import { Cnab240SegmentCode } from '../cnab240-record-types'
import { Cnab400RecordType } from '../cnab400-record-types'
import { ReadMode } from './read-mode'
import { BankSchema, RecordSchema, CNABProvider } from '@tp-types/bank'
import { CNABError, CNABGroupingError, CNABLazyResolveError } from '@tp-types/errors'
import { validateCnab240Content } from '@validators/cnab240-content-validator'
import { validateCnab400Content } from '@validators/cnab400-content-validator'
import { validateCnab240Structure } from '@validators/cnab240-structure-validator'
import { validateCnab400Structure } from '@validators/cnab400-structure-validator'
import { mergeValidationErrors } from '@validators/merge-validation-errors'
import { extractLineFields } from '@parser/field-extractor'
import { getCnab400RecordType, getCnab240RecordType, getCnab240SegmentCode } from '@parser/position-reader'
import { getCnab240SegmentYVariant } from '@parser/cnab-positions'
import type { CNABData } from '@tp-types/read'
import type { BillGroup } from '@tp-types/processing'
import type { ReadOptions, ReadAsyncOptions } from './read-options'
import type { CNABReadResult } from './read-result'
import type { LazyBillItem } from './lazy-bill'
import { ValidationResult } from '@/validators/types'

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

  getLines(): readonly string[] {
    return this.rawLines
  }

  toString(): string {
    const formatLabel = this.type === CNABFormatCode.CNAB240 ? 'CNAB 240' : 'CNAB 400'
    return `CNABFile { type: ${formatLabel}, bank: ${this.bankName} (${this.bankCode}), lines: ${this.lineCount} }`
  }

  private resolveProvider(mode: ReadMode): CNABProvider {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getProvider } = require('@/provider/catalog')
    return getProvider(this.bankCode, this.type, mode)
  }

  validate(): boolean
  validate(withFeedback: false): boolean
  validate(withFeedback: true): CNABValidationResult
  validate(withFeedback?: boolean): boolean | CNABValidationResult {
    const provider = this.resolveProvider(ReadMode.SIMPLE)
    const bankSchema = provider.schema

    const shouldFailFast = withFeedback !== true
    if (shouldFailFast) {
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

  private parseBodyLine(line: string, bankSchema: BankSchema): ParsedLine | undefined {
    if (this.type === CNABFormatCode.CNAB400) {
      return this.parseCnab400Line(line, bankSchema)
    } else {
      return this.parseCnab240Line(line, bankSchema)
    }
  }

  private parseCnab400Line(line: string, bankSchema: BankSchema): ParsedLine | undefined {
    const recordType = getCnab400RecordType(line)
    
    if (recordType === Cnab400RecordType.DETAIL_STANDARD || recordType === Cnab400RecordType.DETAIL_BB) {
      return extractLineFields(line, bankSchema.detail!)
    }
    
    if (bankSchema.optionalRecords) {
      for (const optional of bankSchema.optionalRecords) {
        if (optional.identifier === recordType) {
          return extractLineFields(line, optional.schema)
        }
        
        // Suporte para identificadores compostos (ex: '5-99' do BB)
        if (optional.identifier.includes('-') && optional.identifier.startsWith(recordType)) {
          return extractLineFields(line, optional.schema)
        }
      }
    }
    
    return extractLineFields(line, bankSchema.detail!)
  }


  private parseCnab240Line(line: string, bankSchema: BankSchema): ParsedLine | undefined {
    const recordType = getCnab240RecordType(line)
    
    if (recordType === '3') {
      const segment = getCnab240SegmentCode(line)
      
      if (segment === Cnab240SegmentCode.P) {
        return extractLineFields(line, bankSchema.segmentoP!)
      } 
      else if (segment === Cnab240SegmentCode.Q) {
        return extractLineFields(line, bankSchema.segmentoQ!)
      } 
      else if (segment === Cnab240SegmentCode.R && bankSchema.optionalRecords) {
        const optR = bankSchema.optionalRecords.find((o: { identifier: string; schema: RecordSchema }) => o.identifier === 'R')
        if (optR != null) {
          return extractLineFields(line, optR.schema)
        }
      } 
      else if (segment === Cnab240SegmentCode.S && bankSchema.optionalRecords) {
        const optS = bankSchema.optionalRecords.find((o: { identifier: string; schema: RecordSchema }) => o.identifier === 'S')
        if (optS != null) {
          return extractLineFields(line, optS.schema)
        }
      } 
      else if (segment === Cnab240SegmentCode.Y && bankSchema.optionalRecords) {
        const subVariant = getCnab240SegmentYVariant(line)
        const optY = bankSchema.optionalRecords.find((o: { identifier: string; schema: RecordSchema }) => o.identifier === `Y${subVariant}`)
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

    const bodyParsed = bodyLines
      .map((line) => this.parseBodyLine(line, bankSchema))
      .filter((parsed): parsed is ParsedLine => parsed !== undefined)

    return { headerParsed, trailerParsed, bodyParsed }
  }

  /**
   * Use para arquivos grandes quando não precisa carregar tudo de uma vez.
   */
  read(options: ReadOptions & { lazy: true }): CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>>

  /**
   * Use para arquivos pequenos ou quando precisa de todos os dados de uma vez.
   */
  read(options?: ReadOptions): CNABReadResult<CNABData | Record<string, unknown>>

  read(options?: ReadOptions): CNABReadResult<CNABData | Record<string, unknown>> | CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>> {
    const mode = options?.mode ?? ReadMode.SIMPLE
    const lazy = options?.lazy ?? false

    const provider = this.resolveProvider(mode)
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

  async readAsync(options: ReadAsyncOptions & { lazy: true }): Promise<CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>>>

  async readAsync(options?: ReadAsyncOptions): Promise<CNABReadResult<CNABData | Record<string, unknown>>>

  async readAsync(options?: ReadAsyncOptions): Promise<CNABReadResult<CNABData | Record<string, unknown>> | CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>>> {
    const batchSize = options?.batchSize ?? 100
    const onProgress = options?.onProgress
    const mode = options?.mode ?? ReadMode.SIMPLE
    const lazy = options?.lazy ?? false

    const provider = this.resolveProvider(mode)
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

