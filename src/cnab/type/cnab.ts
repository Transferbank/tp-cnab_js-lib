import { CnabLineData } from '@cnab/type/cnab-line-data'
import { CnabBoleto } from '@cnab/type/cnab-boleto'

export class Cnab {
  readonly header: CnabLineData
  readonly trailer: CnabLineData
  readonly boletos: CnabBoleto[]

  constructor(config: {
    header: CnabLineData
    trailer: CnabLineData
    boletos: CnabBoleto[]
  }) {
    this.header = config.header
    this.trailer = config.trailer
    this.boletos = config.boletos
  }
}
