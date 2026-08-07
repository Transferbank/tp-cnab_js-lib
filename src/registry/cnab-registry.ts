import { CnabDocument } from '@/types/document/cnab-document'
import { CNABFormatCode } from '@/types/core/cnab'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { CNABDocumentValidationError } from '@/types/errors/field-errors'
import { CnabDocumentBradesco400 } from '@/banks/bradesco/documents/cnab-document-bradesco-400'
import { CnabDocumentBradesco240 } from '@/banks/bradesco/documents/cnab-document-bradesco-240'

export type CnabDocumentConstructor = new (rawLines: string[]) => CnabDocument

const CNAB_REGISTRY: Partial<Record<CNABFormatCode, Record<string, CnabDocumentConstructor>>> = {
  [CNABFormatCode.CNAB400]: {
    [BANK_CODES.BRADESCO]: CnabDocumentBradesco400,
  },
  [CNABFormatCode.CNAB240]: {
    [BANK_CODES.BRADESCO]: CnabDocumentBradesco240,
  },
}

export function getCnabDocumentClass(bankCode: string, format: CNABFormatCode): CnabDocumentConstructor {
  const documentClass = CNAB_REGISTRY[format]?.[bankCode]
  if (documentClass == null) {
    throw new CNABDocumentValidationError(
      `combinação banco '${bankCode}' + formato '${format}' ainda não suportada`
    )
  }
  return documentClass
}
