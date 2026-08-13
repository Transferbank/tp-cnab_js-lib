import { CnabBankCode } from './cnab-bank-code'
import { CnabFormat } from './cnab-format'
import { CnabSchema } from './cnab-schema'

export const cnab240Schemas: Record<string, CnabSchema> = {
  
}

export const cnab400Schemas: Record<string, CnabSchema> = {
  
}

export function getSchema(bankCode: CnabBankCode, format: CnabFormat): CnabSchema {
  const schema = format === CnabFormat.CNAB240
    ? cnab240Schemas[bankCode]
    : cnab400Schemas[bankCode]

  if (schema == null) {
    throw new Error(`Schema não encontrado para banco ${bankCode} e formato ${format}`)
  }

  return schema
}
