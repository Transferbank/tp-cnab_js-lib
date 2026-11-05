import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabTipoDeDesconto, CnabTipoDeDescontoTable } from '@cnab/type/cnab-tipo-de-desconto'

const FEBRABAN_CODES: Record<string, CnabTipoDeDesconto> = {
  '1': CnabTipoDeDesconto.VALOR_FIXO,
  '2': CnabTipoDeDesconto.PERCENTUAL,
  '3': CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO_DIA_CORRIDO,
  '4': CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO_DIA_UTIL,
  '5': CnabTipoDeDesconto.PERCENTUAL_POR_ANTECIPACAO_DIA_CORRIDO,
  '6': CnabTipoDeDesconto.PERCENTUAL_POR_ANTECIPACAO_DIA_UTIL,
  '7': CnabTipoDeDesconto.CANCELAMENTO
}

const CAIXA_CODES: Record<string, CnabTipoDeDesconto> = {
  '1': CnabTipoDeDesconto.VALOR_FIXO,
  '2': CnabTipoDeDesconto.PERCENTUAL,
  '3': CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO_DIA_CORRIDO,
  '4': CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO_DIA_UTIL,
  '5': CnabTipoDeDesconto.PERCENTUAL_POR_ANTECIPACAO_DIA_CORRIDO,
  '6': CnabTipoDeDesconto.PERCENTUAL_POR_ANTECIPACAO_DIA_UTIL
}

export const CNAB_TIPO_DE_DESCONTO_TABLES: Record<CnabBank, Record<CnabFormat, CnabTipoDeDescontoTable>> = {
  [CnabBank.BANCODOBRASIL]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeDesconto.VALOR_FIXO,
        '2': CnabTipoDeDesconto.PERCENTUAL,
        '3': CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO
      },
      zeroCodeMeansNoDesconto: true
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeDesconto.VALOR_FIXO
    }
  },
  [CnabBank.BRADESCO]: {
    [CnabFormat.CNAB240]: {
      codes: FEBRABAN_CODES
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeDesconto.VALOR_FIXO
    }
  },
  [CnabBank.CAIXA]: {
    [CnabFormat.CNAB240]: {
      codes: CAIXA_CODES,
      zeroCodeMeansNoDesconto: true
    },
    [CnabFormat.CNAB400]: {
      codes: CAIXA_CODES,
      zeroCodeMeansNoDesconto: true
    }
  },
  [CnabBank.ITAU]: {
    [CnabFormat.CNAB240]: {
      withoutCode: CnabTipoDeDesconto.VALOR_FIXO
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeDesconto.VALOR_FIXO
    }
  },
  [CnabBank.SANTANDER]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeDesconto.VALOR_FIXO,
        '2': CnabTipoDeDesconto.PERCENTUAL,
        '3': CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO_DIA_CORRIDO,
        '4': CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO_DIA_UTIL
      },
      zeroCodeMeansNoDesconto: true
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeDesconto.VALOR_FIXO
    }
  },
  [CnabBank.SICOOB]: {
    [CnabFormat.CNAB240]: {
      codes: FEBRABAN_CODES
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeDesconto.VALOR_FIXO
    }
  },
  [CnabBank.SICREDI]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeDesconto.VALOR_FIXO,
        '2': CnabTipoDeDesconto.PERCENTUAL,
        '3': CnabTipoDeDesconto.VALOR_POR_ANTECIPACAO_DIA_CORRIDO,
        '7': CnabTipoDeDesconto.CANCELAMENTO
      },
      zeroCodeMeansNoDesconto: true
    },
    [CnabFormat.CNAB400]: {
      codes: {
        'A': CnabTipoDeDesconto.VALOR_FIXO,
        'B': CnabTipoDeDesconto.PERCENTUAL
      }
    }
  }
}

export function getDescontoCodes(bank: CnabBank, format: CnabFormat): Record<string, CnabTipoDeDesconto> | undefined {
  return CNAB_TIPO_DE_DESCONTO_TABLES[bank][format].codes
}

export function zeroCodeMeansNoDesconto(bank: CnabBank, format: CnabFormat): boolean {
  return CNAB_TIPO_DE_DESCONTO_TABLES[bank][format].zeroCodeMeansNoDesconto ?? false
}

export function getTipoDeDesconto(bank: CnabBank, format: CnabFormat, codigo: string | null): CnabTipoDeDesconto | null {
  if (codigo == '0') return null
  const table = CNAB_TIPO_DE_DESCONTO_TABLES[bank][format]
  if (codigo == null) return table.withoutCode ?? null
  return table.codes?.[codigo] ?? CnabTipoDeDesconto.OUTRO
}
