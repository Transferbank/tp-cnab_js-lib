import { detectFormat, detectBank } from '@/parser/format-detector'
import { readCnabLines } from '@/parser/file-reader'
import { getCnabFileClass } from '@/registry/cnab-registry'
import { CnabFile } from '@/types/file/cnab-file'

export async function openCnabFile(file: File): Promise<CnabFile> {
  const rawLines = await readCnabLines(file)
  const format = detectFormat(rawLines)
  const bankCode = detectBank(rawLines[0], format)
  const FileClass = getCnabFileClass(bankCode, format)

  return new FileClass(rawLines)
}

export { CnabFile }
export type { BoletoRange, BoletoResult } from '@/types/file/cnab-file'

export { CnabBoleto } from '@/types/boleto/cnab-boleto'
export type { BoletoFieldName, BoletoReadResult } from '@/types/boleto/cnab-boleto'

export type {
  BoletoCnabData,
  PartialBoletoCnabData,
  CnabFieldValue,
} from '@/types/read/boleto-cnab-data'

export { CNABFormatCode } from '@/types/core/cnab'
export { ReadMode } from '@/types/core/read-mode'

export {
  CNABFieldValidationError,
  CNABFieldNotFoundError,
  CNABBoletoValidationError,
  CNABBoletoNotFoundError,
  CNABFileValidationError,
} from '@/types/errors/field-errors'

export {
  CNABNoLinesProvidedError,
  CNABInvalidHeaderError,
  CNABFormatNotRecognizedError,
  CNABBankNotFoundError,
} from '@/types/errors/error-types'
