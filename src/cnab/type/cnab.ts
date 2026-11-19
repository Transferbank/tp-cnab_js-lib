export class CnabRecord {
  // Valores dos campos, indexados pelo fieldKey (ex: nome_do_sacado)
  readonly fields: Record<string, unknown>

  constructor(config: { fields?: Record<string, unknown> } = {}) {
    this.fields = config.fields ?? {}
  }
}

export class CnabBoleto extends CnabRecord {}

export class CnabHeader extends CnabRecord {}

export class CnabTrailer extends CnabRecord {}

export class Cnab {
  readonly header: CnabHeader
  readonly boletos: CnabBoleto[]
  readonly trailer: CnabTrailer

  constructor(config: { header?: CnabHeader, boletos?: CnabBoleto[], trailer?: CnabTrailer } = {}) {
    this.header = config.header ?? new CnabHeader()
    this.boletos = config.boletos ?? []
    this.trailer = config.trailer ?? new CnabTrailer()
  }
}
