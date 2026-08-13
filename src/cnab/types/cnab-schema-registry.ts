import { CnabBankCode } from './cnab-bank-code'
import { CnabFormat } from './cnab-format'
import { CnabSchema } from './cnab-schema'
import { CNAB_BANK_SCHEMAS } from '../banks/cnab-bank-schemas'

export function getSchema(bankCode: CnabBankCode, format: CnabFormat): CnabSchema {
  const bank = CnabBankCode.getBankFromCode(bankCode)
  const schema = CNAB_BANK_SCHEMAS[bank]?.[format]

  if (schema == null) {
    throw new Error(`Schema não encontrado para banco ${bankCode} e formato ${format}`)
  }

  return schema
}
