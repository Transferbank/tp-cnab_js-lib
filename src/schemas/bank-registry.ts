import { BankSchema, CNABFormatCode, BANK_CODES, BankCode } from '@/types/all-types'
import { CNABSchemaNotFoundError } from '@/types/errors/error-types'

import { bancoDoBrasilCnab400 } from '@/banks/bancoDoBrasil/schemas/cnab400/schema-cnab400'
import { bradescoCnab400 } from '@/banks/bradesco/schemas/cnab400/schema-cnab400'
import { itauCnab400 } from '@/banks/itau/schemas/cnab400/schema-cnab400'
import { santanderCnab400 } from '@/banks/santander/schemas/cnab400/schema-cnab400'
import { caixaCnab400 } from '@/banks/caixa/schemas/cnab400/schema-cnab400'
import { sicoobCnab400 } from '@/banks/sicoob/schemas/cnab400/schema-cnab400'
import { sicrediCnab400 } from '@/banks/sicredi/schemas/cnab400/schema-cnab400'

import { bradescoCnab240 } from '@/banks/bradesco/schemas/cnab240/schema-cnab240'
import { santanderCnab240 } from '@/banks/santander/schemas/cnab240/schema-cnab240'
import { sicrediCnab240 } from '@/banks/sicredi/schemas/cnab240/schema-cnab240'

export const cnab400Banks: Partial<Record<BankCode, BankSchema>> = {
  [BANK_CODES.BANCO_DO_BRASIL]: bancoDoBrasilCnab400,
  [BANK_CODES.SANTANDER]: santanderCnab400,
  [BANK_CODES.CAIXA]: caixaCnab400,
  [BANK_CODES.BRADESCO]: bradescoCnab400,
  [BANK_CODES.ITAU]: itauCnab400,
  [BANK_CODES.SICREDI]: sicrediCnab400,
  [BANK_CODES.SICOOB]: sicoobCnab400,
}

export const cnab240Banks: Partial<Record<BankCode, BankSchema>> = {
  [BANK_CODES.SANTANDER]: santanderCnab240,
  [BANK_CODES.BRADESCO]: bradescoCnab240,
  [BANK_CODES.SICREDI]: sicrediCnab240,
}

export function getBankSchema(bankCode: string, format: CNABFormatCode): BankSchema {
  const schema = format === CNABFormatCode.CNAB240
    ? cnab240Banks[bankCode as BankCode]
    : cnab400Banks[bankCode as BankCode]

  if (schema == null) {
    throw new CNABSchemaNotFoundError(bankCode, format)
  }

  return schema
}
