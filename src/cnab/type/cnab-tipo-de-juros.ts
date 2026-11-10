export enum CnabTipoDeJuros {
  VALOR_POR_DIA = 'valor_por_dia',
  VALOR_POR_DIA_UTIL = 'valor_por_dia_util',
  TAXA_MENSAL = 'taxa_mensal',
  TAXA_MENSAL_DIAS_UTEIS = 'taxa_mensal_dias_uteis',
  TAXA_DIARIA = 'taxa_diaria',
  ISENTO = 'isento',
  OUTRO = 'outro'
}

export interface CnabTipoDeJurosTable {
  codes?: Record<string, CnabTipoDeJuros>
  withoutCode?: CnabTipoDeJuros
}
