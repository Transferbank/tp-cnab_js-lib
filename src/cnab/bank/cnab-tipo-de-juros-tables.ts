import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabTipoDeJuros, CnabTipoDeJurosTable } from '@cnab/type/cnab-tipo-de-juros'

export const CNAB_TIPO_DE_JUROS_TABLES: Record<CnabBank, Record<CnabFormat, CnabTipoDeJurosTable>> = {
  [CnabBank.BANCODOBRASIL]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeJuros.VALOR_POR_DIA,
        '2': CnabTipoDeJuros.TAXA_MENSAL,
        '3': CnabTipoDeJuros.ISENTO
      }
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeJuros.VALOR_POR_DIA
    }
  },
  [CnabBank.BRADESCO]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeJuros.VALOR_POR_DIA,
        '2': CnabTipoDeJuros.TAXA_MENSAL,
        '3': CnabTipoDeJuros.ISENTO
      }
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeJuros.VALOR_POR_DIA
    }
  },
  [CnabBank.CAIXA]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeJuros.VALOR_POR_DIA,
        '2': CnabTipoDeJuros.TAXA_MENSAL,
        '3': CnabTipoDeJuros.ISENTO
      }
    },
    [CnabFormat.CNAB400]: {
      codes: {
        '1': CnabTipoDeJuros.VALOR_POR_DIA,
        '6': CnabTipoDeJuros.VALOR_POR_DIA,
        '3': CnabTipoDeJuros.TAXA_MENSAL,
        '8': CnabTipoDeJuros.TAXA_MENSAL,
        '5': CnabTipoDeJuros.ISENTO
      }
    }
  },
  [CnabBank.ITAU]: {
    [CnabFormat.CNAB240]: {
      withoutCode: CnabTipoDeJuros.VALOR_POR_DIA
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeJuros.VALOR_POR_DIA
    }
  },
  [CnabBank.SANTANDER]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeJuros.VALOR_POR_DIA,
        '2': CnabTipoDeJuros.TAXA_MENSAL,
        '3': CnabTipoDeJuros.ISENTO,
        '4': CnabTipoDeJuros.OUTRO,
        '5': CnabTipoDeJuros.VALOR_POR_DIA
      }
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeJuros.VALOR_POR_DIA
    }
  },
  [CnabBank.SICOOB]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '0': CnabTipoDeJuros.ISENTO,
        '1': CnabTipoDeJuros.VALOR_POR_DIA,
        '2': CnabTipoDeJuros.TAXA_MENSAL
      }
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeJuros.TAXA_MENSAL
    }
  },
  [CnabBank.SICREDI]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeJuros.VALOR_POR_DIA,
        '2': CnabTipoDeJuros.TAXA_MENSAL,
        '3': CnabTipoDeJuros.ISENTO
      }
    },
    [CnabFormat.CNAB400]: {
      codes: {
        'A': CnabTipoDeJuros.VALOR_POR_DIA,
        'B': CnabTipoDeJuros.TAXA_DIARIA,
        'C': CnabTipoDeJuros.TAXA_MENSAL
      }
    }
  }
}

export function getJurosCodes(bank: CnabBank, format: CnabFormat): Record<string, CnabTipoDeJuros> | undefined {
  return CNAB_TIPO_DE_JUROS_TABLES[bank][format].codes
}

export function getTipoDeJuros(bank: CnabBank, format: CnabFormat, codigo: string | null): CnabTipoDeJuros | null {
  const table = CNAB_TIPO_DE_JUROS_TABLES[bank][format]
  if (codigo == null) return table.withoutCode ?? null
  return table.codes?.[codigo] ?? CnabTipoDeJuros.OUTRO
}
