import { CnabLineSchema } from '@cnab/types/cnab-line-schema'

export interface CnabSchema {
  header: CnabLineSchema
  trailer: CnabLineSchema
  boleto: CnabLineSchema
}
