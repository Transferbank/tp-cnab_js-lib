import { CNABFormatCode, CNABFileValidationResult, ParsedLine } from './cnab'
import { BankSchema, RecordSchema } from '../bank'
import { CNABError, CNABInternalInconsistencyError, CNABGroupingError, CNABLazyResolveError } from '../errors'
import { validateCnab240Business } from '../../validators/cnab240-business-validator'
import { validateCnab400Business } from '../../validators/cnab400-business-validator'
import { validateCnab240Structure } from '../../validators/cnab240-structure-validator'
import { validateCnab400Structure } from '../../validators/cnab400-structure-validator'
import { mergeValidationErrors } from '../../validators/merge-validation-errors'
import { extractLineFields } from '../../parser/field-extractor'
import type { CNABHeader, CNABTrailer, CNABData } from '../read'
import type { ReadMode } from './read-mode'
import type { BillGroup } from '../processing'

/**
 * Boleto ainda não extraído (lazy: true) — resolve() faz a extração sob
 * demanda. Sem cache: chamar resolve() mais de uma vez reprocessa.
 */
export interface LazyBillItem<T> {
  /** Linha física (1-indexed) onde o núcleo deste boleto começa no arquivo. */
  startLine: number
  /**
   * Extrai os dados do boleto sob demanda.
   * @returns Promise com os dados extraídos
   * @throws {CNABLazyResolveError} se ocorrer falha inesperada durante a extração
   */
  resolve: () => Promise<T>
}

/**
 * Opções de paginação para leitura de boletos.
 */
export interface ReadPageOptions {
  /**
   * Índice do primeiro boleto a retornar (0-indexed).
   */
  start: number
  
  /**
   * Quantidade de boletos a retornar.
   */
  size: number
}

/**
 * Opções para read() e readAsync().
 */
export interface ReadOptions {
  /**
   * Modo de leitura: 'SIMPLE' (padrão) ou 'FULL'.
   */
  mode?: ReadMode
  
  /**
   * Extração lazy: quando true, bills[] vem como LazyBillItem[] (extração sob demanda).
   * Combinável com mode: 'SIMPLE' ou 'FULL'.
   */
  lazy?: boolean
  
  /**
   * Paginação: retorna apenas um intervalo de boletos.
   * Útil para arquivos grandes. Se omitido, lê o arquivo inteiro.
   */
  page?: ReadPageOptions
}

/**
 * Callback de progresso para readAsync().
 */
export interface ReadProgressCallback {
  (progress: { current: number; total: number }): void
}

/**
 * Opções adicionais para readAsync().
 */
export interface ReadAsyncOptions extends ReadOptions {
  /**
   * Callback chamado periodicamente com progresso da leitura.
   */
  onProgress?: ReadProgressCallback
  
  /**
   * Quantidade de boletos processados entre cada chamada de onProgress.
   * Padrão: 100
   */
  batchSize?: number
}

/**
 * Result of read() and readAsync().
 * Generic to support both SIMPLE mode (CNABData) and FULL mode (Record<string, unknown>).
 */
export interface CNABReadResult<T = CNABData> {
  header: CNABHeader
  trailer: CNABTrailer
  bills: T[]
}

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
    const formatLabel = this.type === 'cnab240' ? 'CNAB 240' : 'CNAB 400'
    return `CNABFile { type: ${formatLabel}, bank: ${this.bankName} (${this.bankCode}), lines: ${this.lineCount} }`
  }

  /**
   * Valida o conteúdo do arquivo CNAB usando as regras do banco e formato detectados.
   * 
   * Combina duas camadas de validação:
   * 1. Estrutural (validateCnab240Structure/validateCnab400Structure): sequência de registros,
   *    tipos em posições corretas, pareamento P+Q, contadores, etc.
   * 2. Negócio (validateCnab240/validateCnab400): valores, datas, documentos, nomes, etc.
   * 
   * As duas camadas rodam sempre (modelo merge, não gate) — uma linha ruim não impede
   * validação das demais. Quando ambas reportam erro na mesma (linha, coluna), a versão
   * estrutural prevalece (é schema-driven).
   * 
   * @param options - Opções de validação
   * @param options.withFeedback - Se true, retorna registros detalhados (modo assíncrono, não implementado nesta issue)
   * @returns Resultado da validação com lista de erros estruturados
   * @throws {CNABInternalInconsistencyError} se provider não encontrado (inconsistência interna: schema existe mas agrupamento não)
   */
  validate(options?: { withFeedback?: boolean }): CNABFileValidationResult {
    if (options?.withFeedback) {
      throw new Error('validate({ withFeedback: true }) ainda não implementado')
    }

    // Lazy import para evitar dependência circular
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getProvider } = require('../../provider/catalog')

    const provider = getProvider(this.bankCode, this.type, 'SIMPLE')
    if (!provider) {
      // Não deve acontecer na prática: this.bankSchema já existe (resolvido em
      // openCnab() via getBankSchema), então cnab400Banks/cnab240Banks tem esse
      // banco+formato cadastrado. Se getProvider retornou null mesmo assim, é
      // porque a regra de agrupamento (getGroupingRule) não tem entrada
      // pra esse banco+formato — uma inconsistência entre os dois registries,
      // não um caso de uso normal do usuário da lib.
      throw new CNABInternalInconsistencyError(this.bankCode, this.type)
    }

    const bankSchema = provider.schema

    // Validação estrutural
    const structureResult =
      this.type === 'cnab240'
        ? validateCnab240Structure(this.rawLines, bankSchema)
        : validateCnab400Structure(this.rawLines, bankSchema)

    // Validação de negócio
    const businessResult =
      this.type === 'cnab240'
        ? validateCnab240Business(this.rawLines, bankSchema)
        : validateCnab400Business(this.rawLines, bankSchema)

    // Mescla erros, removendo duplicatas (estrutural prevalece)
    const errors = mergeValidationErrors(structureResult.errors, businessResult.errors)

    const formatLabel = this.type === 'cnab240' ? 'CNAB 240' : 'CNAB 400'

    return {
      isValid: errors.length === 0,
      feedback: {
        type: formatLabel,
        bank: this.bankName,
        lines: errors,
      },
    }
  }

  /**
   * Lê os dados estruturados do arquivo CNAB (modo síncrono).
   * 
   * @param options - mode: 'FULL', lazy: true
   * @returns Objeto com header, trailer e lista de LazyBillItem (todos campos do banco, extração sob demanda)
   * @throws {CNABInternalInconsistencyError} se provider não encontrado (inconsistência interna)
   * @throws {CNABGroupingError} se falha ao agrupar linhas em boletos
   * @throws {CNABUnknownFieldCodeError} se código de campo não reconhecido durante extração canônica
   */
  read(options: { mode: 'FULL'; lazy: true } & Omit<ReadOptions, 'mode' | 'lazy'>): CNABReadResult<LazyBillItem<Record<string, unknown>>>
  
  /**
   * Lê os dados estruturados do arquivo CNAB (modo síncrono).
   * 
   * @param options - mode: 'FULL'
   * @returns Objeto com header, trailer e lista de boletos (todos campos do banco)
   * @throws {CNABInternalInconsistencyError} se provider não encontrado (inconsistência interna)
   * @throws {CNABGroupingError} se falha ao agrupar linhas em boletos
   * @throws {CNABUnknownFieldCodeError} se código de campo não reconhecido durante extração canônica
   */
  read(options: { mode: 'FULL' } & Omit<ReadOptions, 'mode'>): CNABReadResult<Record<string, unknown>>
  
  /**
   * Lê os dados estruturados do arquivo CNAB (modo síncrono).
   * 
   * @param options - lazy: true
   * @returns Objeto com header, trailer e lista de LazyBillItem (campos canônicos, extração sob demanda)
   * @throws {CNABInternalInconsistencyError} se provider não encontrado (inconsistência interna)
   * @throws {CNABGroupingError} se falha ao agrupar linhas em boletos
   * @throws {CNABUnknownFieldCodeError} se código de campo não reconhecido durante extração canônica
   */
  read(options: { lazy: true } & Omit<ReadOptions, 'lazy'>): CNABReadResult<LazyBillItem<CNABData>>
  
  /**
   * Lê os dados estruturados do arquivo CNAB (modo síncrono).
   * 
   * @param options - Opções de leitura (modo, paginação)
   * @returns Objeto com header, trailer e lista de boletos (campos canônicos)
   * @throws {CNABInternalInconsistencyError} se provider não encontrado (inconsistência interna)
   * @throws {CNABGroupingError} se falha ao agrupar linhas em boletos
   * @throws {CNABUnknownFieldCodeError} se código de campo não reconhecido durante extração canônica
   */
  read(options?: ReadOptions): CNABReadResult<CNABData>
  
  read(options?: ReadOptions): CNABReadResult<CNABData> | CNABReadResult<Record<string, unknown>> | CNABReadResult<LazyBillItem<CNABData>> | CNABReadResult<LazyBillItem<Record<string, unknown>>> {
    const mode = options?.mode ?? 'SIMPLE'
    const lazy = options?.lazy ?? false

    // Lazy import para evitar dependência circular
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getProvider } = require('../../provider/catalog')

    const provider = getProvider(this.bankCode, this.type, mode)
    if (!provider) {
      throw new CNABInternalInconsistencyError(this.bankCode, this.type)
    }

    const bankSchema = provider.schema

    // Separa header, corpo e trailer
    const headerLine = this.rawLines[0]
    const trailerLine = this.rawLines[this.rawLines.length - 1]
    const bodyLines = this.rawLines.slice(1, -1)

    // Parseia header e trailer
    const headerSchema = this.type === 'cnab240' ? bankSchema.headerArquivo : bankSchema.header
    const trailerSchema = this.type === 'cnab240' ? bankSchema.trailerArquivo : bankSchema.trailer
    
    const headerParsed = headerSchema ? extractLineFields(headerLine, headerSchema) : undefined
    const trailerParsed = trailerSchema ? extractLineFields(trailerLine, trailerSchema) : undefined

    // Parseia linhas do corpo
    const bodyParsed = bodyLines.map((line) => {
      // Para cada linha, identifica o schema correto e parseia
      // CNAB 400: usa posição 1 para identificar tipo
      // CNAB 240: usa posição 8 para tipo geral, posição 14 para segmento
      
      if (this.type === 'cnab400') {
        const recordType = line.charAt(0)
        
        if (recordType === '1' || recordType === '7') {
          return extractLineFields(line, bankSchema.detail!)
        }
        
        // Registros opcionais
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
        const recordType = line.charAt(7)
        
        if (recordType === '3') {
          const segment = line.charAt(13)
          
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
            const subVariant = line.substring(17, 19)
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
              const result = mode === 'FULL' ? provider.extractBillFull(group) : provider.extractBill(group)
              return Promise.resolve(result)
            } catch (error) {
              if (error instanceof CNABError) return Promise.reject(error)
              return Promise.reject(new CNABLazyResolveError(group.startLine, error))
            }
          },
        }))
      : paginatedGroups.map((group: BillGroup) =>
          mode === 'FULL' ? provider.extractBillFull(group) : provider.extractBill(group)
        )

    return {
      header,
      trailer,
      bills,
    }
  }

  /**
   * Lê os dados estruturados do arquivo CNAB (modo assíncrono com callback de progresso).
   * 
   * @param options - mode: 'FULL', lazy: true
   * @returns Promise com objeto contendo header, trailer e lista de LazyBillItem (todos campos do banco, extração sob demanda)
   * @throws {CNABInternalInconsistencyError} se provider não encontrado (inconsistência interna)
   * @throws {CNABGroupingError} se falha ao agrupar linhas em boletos
   * @throws {CNABUnknownFieldCodeError} se código de campo não reconhecido durante extração canônica
   */
  async readAsync(options: { mode: 'FULL'; lazy: true } & Omit<ReadAsyncOptions, 'mode' | 'lazy'>): Promise<CNABReadResult<LazyBillItem<Record<string, unknown>>>>
  
  /**
   * Lê os dados estruturados do arquivo CNAB (modo assíncrono com callback de progresso).
   * 
   * @param options - mode: 'FULL'
   * @returns Promise com objeto contendo header, trailer e lista de boletos (todos campos do banco)
   * @throws {CNABInternalInconsistencyError} se provider não encontrado (inconsistência interna)
   * @throws {CNABGroupingError} se falha ao agrupar linhas em boletos
   * @throws {CNABUnknownFieldCodeError} se código de campo não reconhecido durante extração canônica
   */
  async readAsync(options: { mode: 'FULL' } & Omit<ReadAsyncOptions, 'mode'>): Promise<CNABReadResult<Record<string, unknown>>>
  
  /**
   * Lê os dados estruturados do arquivo CNAB (modo assíncrono com callback de progresso).
   * 
   * @param options - lazy: true
   * @returns Promise com objeto contendo header, trailer e lista de LazyBillItem (campos canônicos, extração sob demanda)
   * @throws {CNABInternalInconsistencyError} se provider não encontrado (inconsistência interna)
   * @throws {CNABGroupingError} se falha ao agrupar linhas em boletos
   * @throws {CNABUnknownFieldCodeError} se código de campo não reconhecido durante extração canônica
   */
  async readAsync(options: { lazy: true } & Omit<ReadAsyncOptions, 'lazy'>): Promise<CNABReadResult<LazyBillItem<CNABData>>>
  
  /**
   * Lê os dados estruturados do arquivo CNAB (modo assíncrono com callback de progresso).
   * 
   * @param options - Opções de leitura (modo, paginação, callback de progresso)
   * @returns Promise com objeto contendo header, trailer e lista de boletos (campos canônicos)
   * @throws {CNABInternalInconsistencyError} se provider não encontrado (inconsistência interna)
   * @throws {CNABGroupingError} se falha ao agrupar linhas em boletos
   * @throws {CNABUnknownFieldCodeError} se código de campo não reconhecido durante extração canônica
   */
  async readAsync(options?: ReadAsyncOptions): Promise<CNABReadResult<CNABData>>
  
  async readAsync(options?: ReadAsyncOptions): Promise<CNABReadResult<CNABData> | CNABReadResult<Record<string, unknown>> | CNABReadResult<LazyBillItem<CNABData>> | CNABReadResult<LazyBillItem<Record<string, unknown>>>> {
    const mode = options?.mode ?? 'SIMPLE'
    const lazy = options?.lazy ?? false
    const batchSize = options?.batchSize ?? 100
    const onProgress = options?.onProgress

    // Lazy import para evitar dependência circular
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getProvider } = require('../../provider/catalog')

    const provider = getProvider(this.bankCode, this.type, mode)
    if (!provider) {
      throw new CNABInternalInconsistencyError(this.bankCode, this.type)
    }

    const bankSchema = provider.schema

    // Separa header, corpo e trailer
    const headerLine = this.rawLines[0]
    const trailerLine = this.rawLines[this.rawLines.length - 1]
    const bodyLines = this.rawLines.slice(1, -1)

    // Parseia header e trailer
    const headerSchema = this.type === 'cnab240' ? bankSchema.headerArquivo : bankSchema.header
    const trailerSchema = this.type === 'cnab240' ? bankSchema.trailerArquivo : bankSchema.trailer
    
    const headerParsed = headerSchema ? extractLineFields(headerLine, headerSchema) : undefined
    const trailerParsed = trailerSchema ? extractLineFields(trailerLine, trailerSchema) : undefined

    // Parseia linhas do corpo com progresso
    const bodyParsed: ParsedLine[] = []
    
    for (let i = 0; i < bodyLines.length; i++) {
      const line = bodyLines[i]
      
      // Parse da linha (mesmo código do read())
      let parsed: ParsedLine | undefined
      
      if (this.type === 'cnab400') {
        const recordType = line.charAt(0)
        
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
        const recordType = line.charAt(7)
        
        if (recordType === '3') {
          const segment = line.charAt(13)
          
          if (segment === 'P') {
            parsed = extractLineFields(line, bankSchema.segmentoP!)
          } else if (segment === 'Q') {
            parsed = extractLineFields(line, bankSchema.segmentoQ!)
          } else if (bankSchema.optionalRecords) {
            if (segment === 'Y') {
              const subVariant = line.substring(17, 19)
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
      
      if (onProgress && (i + 1) % batchSize === 0) {
        onProgress({ current: i + 1, total: bodyLines.length })
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }
    
    if (onProgress && bodyLines.length % batchSize !== 0) {
      onProgress({ current: bodyLines.length, total: bodyLines.length })
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
    
    const bills = lazy
      ? paginatedGroups.map((group: BillGroup) => ({
          startLine: group.startLine,
          resolve: (): Promise<CNABData | Record<string, unknown>> => {
            try {
              const result = mode === 'FULL' ? provider.extractBillFull(group) : provider.extractBill(group)
              return Promise.resolve(result)
            } catch (error) {
              if (error instanceof CNABError) return Promise.reject(error)
              return Promise.reject(new CNABLazyResolveError(group.startLine, error))
            }
          },
        }))
      : paginatedGroups.map((group: BillGroup) =>
          mode === 'FULL' ? provider.extractBillFull(group) : provider.extractBill(group)
        )

    return {
      header,
      trailer,
      bills,
    }
  }
}



