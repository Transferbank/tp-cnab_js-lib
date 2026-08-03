import { detectFormat, detectBank } from '@parser/format-detector'
import { getBankSchema } from '@/schemas/bank-registry'
import { CNABFile } from '@/types/core/core-types'
import { readCnabFile } from '@/utils/file-reader'

export function extractCnabFile(txt: string[]): CNABFile {
  const format = detectFormat(txt)
  const bankCode = detectBank(txt[0], format)
  const bankSchema = getBankSchema(bankCode, format)

  return new CNABFile(format, bankSchema, txt)
}

export async function openCnab(file: File): Promise<CNABFile> {
  const rawText = await readCnabFile(file)
  return extractCnabFile(rawText)
}

export { CNABFile } from '@/types/core/core-types'

export type {
  CNABValidationResult,
  ValidationError,
  CNABRecord,
  CNABReadResult,
  ReadOptions,
  ReadAsyncOptions,
  LazyBillItem,
} from './types/core/core-types'

export type {
  CNABData,
  CNABHeader,
  CNABTrailer,
} from './types/read/read-types'

export { CNABFormatCode } from './types/core/core-types'
export { ReadMode } from './types/core/read-mode'

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
} from './types/errors/error-types'
