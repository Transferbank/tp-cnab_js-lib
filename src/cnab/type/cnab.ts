import { CnabLineSchema } from '@cnab/type/cnab-line-schema'

export class Cnab {
  readonly header: CnabLineSchema
  readonly trailer: CnabLineSchema
  readonly boletos: CnabLineSchema[]

  constructor(config: {
    header: CnabLineSchema
    trailer: CnabLineSchema
    boletos?: CnabLineSchema[]
  }) {
    this.header = config.header
    this.trailer = config.trailer
    this.boletos = config.boletos ?? []
  }
}
