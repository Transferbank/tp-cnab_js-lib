export class CnabBoleto {
  // Valores dos campos do boleto, indexados pelo fieldKey (ex: nome_do_sacado)
  readonly fields: Record<string, unknown>

  constructor(config: { fields?: Record<string, unknown> } = {}) {
    this.fields = config.fields ?? {}
  }
}

export class Cnab {
  readonly boletos: CnabBoleto[]

  constructor(config: { boletos?: CnabBoleto[] } = {}) {
    this.boletos = config.boletos ?? []
  }
}
