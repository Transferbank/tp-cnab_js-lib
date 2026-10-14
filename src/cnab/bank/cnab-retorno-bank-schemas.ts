import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabSchema } from '@cnab/type/cnab-schema'
import { indexCnabSchemas } from '@cnab/bank/cnab-remessa-bank-schemas'

export const CNAB_RETORNO_BANK_SCHEMAS: Record<CnabBank, Record<CnabFormat, CnabSchema>> = indexCnabSchemas([])
