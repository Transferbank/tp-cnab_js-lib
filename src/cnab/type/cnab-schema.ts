import { CnabLineSchema } from '@cnab/type/cnab-line-schema'

export interface CnabSchema {
  header: CnabLineSchema
  trailer: CnabLineSchema
  boleto: CnabLineSchema
}
