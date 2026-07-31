/**
 * CNAB-Lib — Biblioteca TypeScript para processamento de arquivos CNAB
 * 
 * Suporta CNAB 240 e CNAB 400 com validação estrutural e de negócio
 */

import { detectFormat, detectBank } from '@parser/format-detector'
import { getBankSchema } from '@schemas/index'
import { CNABFile } from '@tp-types/core'
import { readCnabFile } from '@/utils/file-reader'

export async function openCnab(file: File): Promise<CNABFile> {
  const rawLines = await readCnabFile(file)
  const format = detectFormat(rawLines)
  const bankCode = detectBank(rawLines[0], format)
  const bankSchema = getBankSchema(bankCode, format)

  return new CNABFile(format, bankSchema, rawLines)
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
