export enum CnabTipoDeJuros {
  VALOR_POR_DIA = 'valor_por_dia',
  TAXA_MENSAL = 'taxa_mensal',
  TAXA_DIARIA = 'taxa_diaria',
  ISENTO = 'isento',
  OUTRO = 'outro'
}

export interface CnabTipoDeJurosTable {
  codes?: Record<string, CnabTipoDeJuros>
  withoutCode?: CnabTipoDeJuros
}
