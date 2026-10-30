import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabTipoDeMulta, CnabTipoDeMultaTable } from '@cnab/type/cnab-tipo-de-multa'

export const CNAB_TIPO_DE_MULTA_TABLES: Record<CnabBank, Record<CnabFormat, CnabTipoDeMultaTable>> = {
  [CnabBank.BANCODOBRASIL]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeMulta.VALOR_FIXO,
        '2': CnabTipoDeMulta.PERCENTUAL
      }
    },
    [CnabFormat.CNAB400]: {
      codes: {
        '1': CnabTipoDeMulta.VALOR_FIXO,
        '2': CnabTipoDeMulta.PERCENTUAL,
        '9': CnabTipoDeMulta.ISENTO
      }
    }
  },
  [CnabBank.BRADESCO]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeMulta.VALOR_FIXO,
        '2': CnabTipoDeMulta.PERCENTUAL
      }
    },
    [CnabFormat.CNAB400]: {
      codes: {
        '0': CnabTipoDeMulta.ISENTO,
        '2': CnabTipoDeMulta.PERCENTUAL
      }
    }
  },
  [CnabBank.CAIXA]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '0': CnabTipoDeMulta.ISENTO,
        '1': CnabTipoDeMulta.VALOR_FIXO,
        '2': CnabTipoDeMulta.PERCENTUAL
      }
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeMulta.VALOR_FIXO
    }
  },
  [CnabBank.ITAU]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '0': CnabTipoDeMulta.ISENTO,
        '1': CnabTipoDeMulta.VALOR_FIXO,
        '2': CnabTipoDeMulta.PERCENTUAL
      }
    },
    [CnabFormat.CNAB400]: {
      codes: {
        '0': CnabTipoDeMulta.ISENTO,
        '1': CnabTipoDeMulta.VALOR_FIXO,
        '2': CnabTipoDeMulta.PERCENTUAL
      }
    }
  },
  [CnabBank.SANTANDER]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeMulta.VALOR_FIXO,
        '2': CnabTipoDeMulta.PERCENTUAL
      }
    },
    [CnabFormat.CNAB400]: {
      codes: {
        '4': CnabTipoDeMulta.PERCENTUAL
      }
    }
  },
  [CnabBank.SICOOB]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '0': CnabTipoDeMulta.ISENTO,
        '1': CnabTipoDeMulta.VALOR_FIXO,
        '2': CnabTipoDeMulta.PERCENTUAL
      }
    },
    [CnabFormat.CNAB400]: {
      withoutCode: CnabTipoDeMulta.PERCENTUAL
    }
  },
  [CnabBank.SICREDI]: {
    [CnabFormat.CNAB240]: {
      codes: {
        '1': CnabTipoDeMulta.VALOR_FIXO,
        '2': CnabTipoDeMulta.PERCENTUAL
      }
    },
    [CnabFormat.CNAB400]: {
      codes: {
        'A': CnabTipoDeMulta.VALOR_FIXO,
        'B': CnabTipoDeMulta.PERCENTUAL
      },
      withoutCode: CnabTipoDeMulta.PERCENTUAL
    }
  }
}

export function getMultaCodes(bank: CnabBank, format: CnabFormat): Record<string, CnabTipoDeMulta> | undefined {
  return CNAB_TIPO_DE_MULTA_TABLES[bank][format].codes
}

export function getTipoDeMulta(bank: CnabBank, format: CnabFormat, codigo: string | null): CnabTipoDeMulta | null {
  const table = CNAB_TIPO_DE_MULTA_TABLES[bank][format]
  if (codigo == null) return table.withoutCode ?? null
  return table.codes?.[codigo] ?? CnabTipoDeMulta.OUTRO
}
