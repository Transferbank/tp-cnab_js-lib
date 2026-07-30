/**
 * CNAB-Lib — Biblioteca TypeScript para processamento de arquivos CNAB
 * 
 * Suporta CNAB 240 e CNAB 400 com validação estrutural e de negócio
 */

import { detectFormat, detectBank } from '@parser/format-detector'
import { getBankSchema } from '@schemas/index'
import { CNABFile } from '@tp-types/core'
import {
  CNABEmptyFileError,
  CNABSchemaNotFoundError,
} from '@tp-types/errors'

/**
 * Abre um arquivo CNAB e retorna um objeto CNABFile com metadados detectados.
 * @param raw - Conteúdo bruto do arquivo (decodificado em Latin-1)
 * @returns Instância de CNABFile com schema disponível
 * @throws {CNABEmptyFileError} se arquivo vazio ou contém apenas linhas em branco
 * @throws {CNABFormatNotRecognizedError} se formato não é CNAB 240 nem CNAB 400
 * @throws {CNABNoLinesProvidedError} se nenhuma linha fornecida (array vazio/null)
 * @throws {CNABInvalidHeaderError} se header vazio, null ou undefined
 * @throws {CNABBankNotFoundError} se código do banco não encontrado no header
 * @throws {CNABSchemaNotFoundError} se banco+formato não possui schema cadastrado
 * @throws {CNABUnknownFieldCodeError} (via read/readAsync) se código de campo não reconhecido durante extração canônica
 */
export function openCnab(raw: string): CNABFile {
  const rawLines = raw?.split(/\r?\n/).filter((line) => line.length > 0) ?? []

  const isEmpty = rawLines.length === 0
  if (isEmpty) {
    throw new CNABEmptyFileError()
  }

  const format = detectFormat(rawLines)
  const bankCode = detectBank(rawLines[0], format)
  const bankSchema = getBankSchema(bankCode, format)

  const hasSchema = bankSchema !== null && bankSchema !== undefined
  if (hasSchema) {
    return new CNABFile(format, bankSchema, rawLines)
  }

  throw new CNABSchemaNotFoundError(bankCode, format)
}

// ========== EXPORTAÇÕES PÚBLICAS ==========

// --- API Principal ---
export { CNABFile } from './types/core'

// --- Tipos (inferidos automaticamente na maioria dos casos) ---
export type {
  // Validação
  CNABValidationResult,
  ValidationError,
  CNABRecord,
  
  // Leitura
  CNABReadResult,
  ReadModeValue,
  
  // Opções
  ReadOptions,
  ReadAsyncOptions,
  LazyBillItem,
} from './types/core'

export type {
  CNABData,
  CNABHeader,
  CNABTrailer,
} from './types/read'

// --- Enums (para comparações) ---
export { CNABFormatCode } from './types/core'
export { ReadMode } from './types/core/read-mode'

// --- Erros (para tratamento de exceções) ---
export {
  CNABError,
  CNABEmptyFileError,
  CNABFormatNotRecognizedError,
  CNABBankNotFoundError,
  CNABSchemaNotFoundError,
  CNABNoLinesProvidedError,
  CNABInvalidHeaderError,
  CNABInternalInconsistencyError,
  CNABGroupingError,
  CNABUnknownFieldCodeError,
  CNABLazyResolveError,
} from './types/errors'
