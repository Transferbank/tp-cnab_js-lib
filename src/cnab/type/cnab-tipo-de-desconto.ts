export enum CnabTipoDeDesconto {
  VALOR_FIXO = 'valor_fixo',
  PERCENTUAL = 'percentual',
  VALOR_POR_ANTECIPACAO = 'valor_por_antecipacao',
  PERCENTUAL_POR_ANTECIPACAO = 'percentual_por_antecipacao',
  CANCELAMENTO = 'cancelamento',
  OUTRO = 'outro'
}

export interface CnabTipoDeDescontoTable {
  codes?: Record<string, CnabTipoDeDesconto>
  withoutCode?: CnabTipoDeDesconto
}
