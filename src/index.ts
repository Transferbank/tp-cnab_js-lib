import { detectFormat, detectBank } from '@/parser/format-detector'
import { readCnabLines } from '@/parser/file-reader'
import { getCnabDocumentClass } from '@/registry/cnab-registry'
import { CnabDocument } from '@/types/document/cnab-document'

export async function openCnabDocument(file: File): Promise<CnabDocument> {
  const rawLines = await readCnabLines(file)
  const format = detectFormat(rawLines)
  const bankCode = detectBank(rawLines[0], format)
  const DocumentClass = getCnabDocumentClass(bankCode, format)

  return new DocumentClass(rawLines)
}

export { CnabDocument }
export type { BoletoRange, BoletoResult } from '@/types/document/cnab-document'

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
  CNABDocumentValidationError,
} from '@/types/errors/field-errors'

export {
  CNABNoLinesProvidedError,
  CNABInvalidHeaderError,
  CNABFormatNotRecognizedError,
  CNABBankNotFoundError,
} from '@/types/errors/error-types'
