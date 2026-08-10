import { CnabFile } from '@/types/file/cnab-file'
import { CNABFormatCode } from '@/types/core/cnab'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { CNABFileValidationError } from '@/types/errors/field-errors'
import { CnabFileBradesco400 } from '@/banks/bradesco/files/cnab-file-bradesco-400'
import { CnabFileBradesco240 } from '@/banks/bradesco/files/cnab-file-bradesco-240'

export type CnabFileConstructor = new (rawLines: string[]) => CnabFile

const CNAB_REGISTRY: Partial<Record<CNABFormatCode, Record<string, CnabFileConstructor>>> = {
  [CNABFormatCode.CNAB400]: {
    [BANK_CODES.BRADESCO]: CnabFileBradesco400,
  },
  [CNABFormatCode.CNAB240]: {
    [BANK_CODES.BRADESCO]: CnabFileBradesco240,
  },
}

export function getCnabFileClass(bankCode: string, format: CNABFormatCode): CnabFileConstructor {
  const fileClass = CNAB_REGISTRY[format]?.[bankCode]
  if (fileClass == null) {
    throw new CNABFileValidationError(
      `combinação banco '${bankCode}' + formato '${format}' ainda não suportada`
    )
  }
  return fileClass
}
