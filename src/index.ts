import { detectFormat, detectBank } from '@parser/format-detector'
import { getBankSchema } from '@schemas/index'
import { CNABFile } from '@tp-types/core'
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

export { CNABFile } from '@tp-types/core'

export type {
  CNABValidationResult,
  ValidationError,
  CNABRecord,
  CNABReadResult,
  ReadOptions,
  ReadAsyncOptions,
  LazyBillItem,
} from './types/core'

export type {
  CNABData,
  CNABHeader,
  CNABTrailer,
} from './types/read'

export { CNABFormatCode } from './types/core'
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
} from './types/errors'
