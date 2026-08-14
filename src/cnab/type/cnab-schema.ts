import { CnabLineSchema } from './cnab-line-schema'

export interface CnabSchema {
  header: CnabLineSchema
  trailer: CnabLineSchema
  boleto: CnabLineSchema
}
