export enum CnabTipoDeDesconto {
  VALOR_FIXO = 'valor_fixo',
  PERCENTUAL = 'percentual',
  VALOR_POR_ANTECIPACAO = 'valor_por_antecipacao',
  VALOR_POR_ANTECIPACAO_DIA_CORRIDO = 'valor_por_antecipacao_dia_corrido',
  VALOR_POR_ANTECIPACAO_DIA_UTIL = 'valor_por_antecipacao_dia_util',
  PERCENTUAL_POR_ANTECIPACAO = 'percentual_por_antecipacao',
  PERCENTUAL_POR_ANTECIPACAO_DIA_CORRIDO = 'percentual_por_antecipacao_dia_corrido',
  PERCENTUAL_POR_ANTECIPACAO_DIA_UTIL = 'percentual_por_antecipacao_dia_util',
  CANCELAMENTO = 'cancelamento',
  OUTRO = 'outro'
}

export interface CnabTipoDeDescontoTable {
  codes?: Record<string, CnabTipoDeDesconto>
  withoutCode?: CnabTipoDeDesconto
  zeroCodeMeansNoDesconto?: boolean
}
