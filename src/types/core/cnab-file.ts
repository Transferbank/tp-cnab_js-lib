import { CNABFormatCode, CNABValidationResult, ParsedLine } from './cnab'
import { ReadMode, type ReadModeValue } from './read-mode'
import { BankSchema, RecordSchema } from '../bank'
import { CNABError, CNABInternalInconsistencyError, CNABGroupingError, CNABLazyResolveError } from '../errors'
import { validateCnab240Content } from '@validators/cnab240-content-validator'
import { validateCnab400Content } from '@validators/cnab400-content-validator'
import { validateCnab240Structure } from '@validators/cnab240-structure-validator'
import { validateCnab400Structure } from '@validators/cnab400-structure-validator'
import { mergeValidationErrors } from '@validators/merge-validation-errors'
import { extractLineFields } from '@parser/field-extractor'
import { getCnab400RecordType, getCnab240RecordType, getCnab240SegmentCode } from '@parser/position-reader'
import { getCnab240SegmentYVariant } from '@parser/cnab-positions'
import type { CNABData } from '../read'
import type { BillGroup } from '../processing'
import type { ReadOptions, ReadAsyncOptions } from './read-options'
import type { CNABReadResult } from './read-result'
import type { LazyBillItem } from './lazy-bill'

/**
 * Representa um arquivo CNAB detectado com schema cadastrado.
 * 
 * Use openCnab() para criar instâncias.
 */
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

  /**
   * Como this.bankSchema já existe (resolvido em openCnab() via getBankSchema),
   * o provider deveria sempre existir. Se getProvider retorna null mesmo assim,
   * é porque a regra de agrupamento não tem entrada para esse banco+formato —
   * uma inconsistência entre os dois registries (schema e grouping), não um caso
   * de uso normal do usuário da lib.
   */
  private resolveProvider(mode: ReadModeValue): any {
    // Lazy import para evitar dependência circular
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getProvider } = require('../../provider/catalog')
    
    const provider = getProvider(this.bankCode, this.type, mode)
    if (!provider) {
      throw new CNABInternalInconsistencyError(this.bankCode, this.type)
    }
    
    return provider
  }

  /**
   * Valida o conteúdo do arquivo CNAB usando as regras do banco e formato detectados.
   * @param options - Opções de validação
   * @param options.withFeedback - Se true, inclui registros parseados para preview (default: false)
   * @returns Resultado da validação com lista de erros (e opcionalmente registros)
   * @throws {CNABInternalInconsistencyError} se provider não encontrado (inconsistência interna: schema existe mas agrupamento não)
   */
  validate(options?: { withFeedback?: boolean }): CNABValidationResult {
    const withFeedback = options?.withFeedback ?? false

    const provider = this.resolveProvider(ReadMode.SIMPLE)
    const bankSchema = provider.schema

    const structureResult =
      this.type === CNABFormatCode.CNAB240
        ? validateCnab240Structure(this.rawLines, bankSchema)
        : validateCnab400Structure(this.rawLines, bankSchema)

    const businessResult =
      this.type === CNABFormatCode.CNAB240
        ? validateCnab240Content(this.rawLines, bankSchema)
        : validateCnab400Content(this.rawLines, bankSchema)

    // Estrutural prevalece sobre negócio em caso de conflito na mesma linha+coluna
    const errors = mergeValidationErrors(structureResult.errors, businessResult.errors)

    const formatLabel = this.type === CNABFormatCode.CNAB240 ? 'CNAB 240' : 'CNAB 400'

    const result: CNABValidationResult = {
      isValid: errors.length === 0,
      feedback: {
        type: formatLabel,
        bank: this.bankName,
        lines: errors,
      },
    }

    if (withFeedback) {
      result.feedback.records = businessResult.records
    }

    return result
  }

  /**
   * Use para arquivos pequenos ou quando precisa de todos os dados de uma vez.
   */
  read(options?: ReadOptions): CNABReadResult<CNABData | Record<string, unknown>>

  /**
   * Use para arquivos grandes quando não precisa carregar tudo de uma vez.
   */
  read(options: ReadOptions & { lazy: true }): CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>>

  read(options?: ReadOptions): CNABReadResult<CNABData | Record<string, unknown>> | CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>> {
    const mode = options?.mode ?? ReadMode.SIMPLE
    const lazy = options?.lazy ?? false

    const provider = this.resolveProvider(mode)
    const bankSchema = provider.schema

    const headerLine = this.rawLines[0]
    const trailerLine = this.rawLines[this.rawLines.length - 1]
    const bodyLines = this.rawLines.slice(1, -1)

    const headerSchema = this.type === CNABFormatCode.CNAB240 ? bankSchema.headerArquivo : bankSchema.header
    const trailerSchema = this.type === CNABFormatCode.CNAB240 ? bankSchema.trailerArquivo : bankSchema.trailer
    
    const headerParsed = headerSchema ? extractLineFields(headerLine, headerSchema) : undefined
    const trailerParsed = trailerSchema ? extractLineFields(trailerLine, trailerSchema) : undefined

    const bodyParsed = bodyLines.map((line) => {
      if (this.type === CNABFormatCode.CNAB400) {
        const recordType = getCnab400RecordType(line)
        
        if (recordType === '1' || recordType === '7') {
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
      } else {
        const recordType = getCnab240RecordType(line)
        
        if (recordType === '3') {
          const segment = getCnab240SegmentCode(line)
          
          if (segment === 'P') {
            return extractLineFields(line, bankSchema.segmentoP!)
          } else if (segment === 'Q') {
            return extractLineFields(line, bankSchema.segmentoQ!)
          } else if (segment === 'R' && bankSchema.optionalRecords) {
            const optR = bankSchema.optionalRecords.find((o: { identifier: string; schema: RecordSchema }) => o.identifier === 'R')
            if (optR) {
              return extractLineFields(line, optR.schema)
            }
          } else if (segment === 'S' && bankSchema.optionalRecords) {
            const optS = bankSchema.optionalRecords.find((o: { identifier: string; schema: RecordSchema }) => o.identifier === 'S')
            if (optS) {
              return extractLineFields(line, optS.schema)
            }
          } else if (segment === 'Y' && bankSchema.optionalRecords) {
            const subVariant = getCnab240SegmentYVariant(line)
            const optY = bankSchema.optionalRecords.find((o: { identifier: string; schema: RecordSchema }) => o.identifier === `Y${subVariant}`)
            if (optY) {
              return extractLineFields(line, optY.schema)
            }
          }
        }
        
        return extractLineFields(line, bankSchema.segmentoP!)
      }
    }).filter((parsed): parsed is ParsedLine => parsed !== undefined)

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
    
    const bills = lazy
      ? paginatedGroups.map((group: BillGroup) => ({
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
      : paginatedGroups.map((group: BillGroup) =>
          mode === ReadMode.FULL ? provider.extractBillFull(group) : provider.extractBill(group)
        )

    return {
      header,
      trailer,
      bills,
    }
  }

  async readAsync(options?: ReadAsyncOptions): Promise<CNABReadResult<CNABData | Record<string, unknown>>>

  async readAsync(options: ReadAsyncOptions & { lazy: true }): Promise<CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>>>

  async readAsync(options?: ReadAsyncOptions): Promise<CNABReadResult<CNABData | Record<string, unknown>> | CNABReadResult<LazyBillItem<CNABData | Record<string, unknown>>>> {
    const mode = options?.mode ?? ReadMode.SIMPLE
    const lazy = options?.lazy ?? false
    const batchSize = options?.batchSize ?? 100
    const onProgress = options?.onProgress

    const provider = this.resolveProvider(mode)
    const bankSchema = provider.schema

    const headerLine = this.rawLines[0]
    const trailerLine = this.rawLines[this.rawLines.length - 1]
    const bodyLines = this.rawLines.slice(1, -1)

    const headerSchema = this.type === CNABFormatCode.CNAB240 ? bankSchema.headerArquivo : bankSchema.header
    const trailerSchema = this.type === CNABFormatCode.CNAB240 ? bankSchema.trailerArquivo : bankSchema.trailer
    
    const headerParsed = headerSchema ? extractLineFields(headerLine, headerSchema) : undefined
    const trailerParsed = trailerSchema ? extractLineFields(trailerLine, trailerSchema) : undefined

    const bodyParsed: ParsedLine[] = []
    
    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i]
      let parsed: ParsedLine | undefined
      
      if (this.type === CNABFormatCode.CNAB400) {
        const recordType = getCnab400RecordType(line)
        
        if (recordType === '1' || recordType === '7') {
          parsed = extractLineFields(line, bankSchema.detail!)
        } else if (bankSchema.optionalRecords) {
          let found = false
          for (const optional of bankSchema.optionalRecords) {
            if (optional.identifier === recordType || 
                (optional.identifier.includes('-') && optional.identifier.startsWith(recordType))) {
              parsed = extractLineFields(line, optional.schema)
              found = true
              break
            }
          }
          if (!found) {
            parsed = extractLineFields(line, bankSchema.detail!)
          }
        } else {
          parsed = extractLineFields(line, bankSchema.detail!)
        }
      } else {
        const recordType = getCnab240RecordType(line)
        
        if (recordType === '3') {
          const segment = getCnab240SegmentCode(line)
          
          if (segment === 'P') {
            parsed = extractLineFields(line, bankSchema.segmentoP!)
          } else if (segment === 'Q') {
            parsed = extractLineFields(line, bankSchema.segmentoQ!)
          } else if (bankSchema.optionalRecords) {
            if (segment === 'Y') {
              const subVariant = getCnab240SegmentYVariant(line)
              const optY = bankSchema.optionalRecords.find((o: { identifier: string; schema: RecordSchema }) => o.identifier === `Y${subVariant}`)
              parsed = optY ? extractLineFields(line, optY.schema) : extractLineFields(line, bankSchema.segmentoP!)
            } else {
              const opt = bankSchema.optionalRecords.find((o: { identifier: string; schema: RecordSchema }) => o.identifier === segment)
              parsed = opt ? extractLineFields(line, opt.schema) : extractLineFields(line, bankSchema.segmentoP!)
            }
          } else {
            parsed = extractLineFields(line, bankSchema.segmentoP!)
          }
        } else {
          parsed = extractLineFields(line, bankSchema.segmentoP!)
        }
      }
      
      if (parsed) {
        bodyParsed.push(parsed)
      }
    }

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
    
    const bills: any[] = []
    const totalBills = paginatedGroups.length
    
    for (let i = 0; i < paginatedGroups.length; i++) {
      const group = paginatedGroups[i]
      
      if (lazy) {
        bills.push({
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
        })
      } else {
        const bill = mode === ReadMode.FULL ? provider.extractBillFull(group) : provider.extractBill(group)
        bills.push(bill)
      }
      
      if (onProgress && (i + 1) % batchSize === 0) {
        onProgress({ current: i + 1, total: totalBills })
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }
    
    if (onProgress && totalBills % batchSize !== 0) {
      onProgress({ current: totalBills, total: totalBills })
    }

    return {
      header,
      trailer,
      bills,
    }
  }
}



