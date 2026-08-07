import { detectFormat, detectBank } from '@/parser/format-detector'
import { getCnabDocumentClass } from '@/registry/cnab-registry'
import { CnabDocument } from '@/types/document/cnab-document'

export function openCnabDocument(rawLines: string[]): CnabDocument {
  const format = detectFormat(rawLines)
  const bankCode = detectBank(rawLines[0], format)
  const DocumentClass = getCnabDocumentClass(bankCode, format)

  return new DocumentClass(rawLines)
}
