export enum CnabTipoDeMulta {
  VALOR_FIXO = 'valor_fixo',
  PERCENTUAL = 'percentual',
  ISENTO = 'isento',
  OUTRO = 'outro'
}

export interface CnabTipoDeMultaTable {
  codes?: Record<string, CnabTipoDeMulta>
  withoutCode?: CnabTipoDeMulta
}
