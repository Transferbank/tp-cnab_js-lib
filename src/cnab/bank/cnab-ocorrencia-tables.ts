import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabOcorrencia, CnabOcorrenciaTable, findOcorrencia } from '@cnab/type/cnab-ocorrencia'
import { BRADESCO_CNAB240_OCORRENCIA_TABLE } from '@cnab/bank/bradesco/cnab/cnab240/ocorrencia-table'
import { BRADESCO_CNAB400_OCORRENCIA_TABLE } from '@cnab/bank/bradesco/cnab/cnab400/ocorrencia-table'
import { CAIXA_CNAB240_OCORRENCIA_TABLE } from '@cnab/bank/caixa/cnab/cnab240/ocorrencia-table'
import { CAIXA_CNAB400_OCORRENCIA_TABLE } from '@cnab/bank/caixa/cnab/cnab400/ocorrencia-table'
import { ITAU_CNAB240_OCORRENCIA_TABLE } from '@cnab/bank/itau/cnab/cnab240/ocorrencia-table'
import { ITAU_CNAB400_OCORRENCIA_TABLE } from '@cnab/bank/itau/cnab/cnab400/ocorrencia-table'
import { SANTANDER_CNAB240_OCORRENCIA_TABLE } from '@cnab/bank/santander/cnab/cnab240/ocorrencia-table'
import { SANTANDER_CNAB400_OCORRENCIA_TABLE } from '@cnab/bank/santander/cnab/cnab400/ocorrencia-table'
import { SICREDI_CNAB240_OCORRENCIA_TABLE } from '@cnab/bank/sicredi/cnab/cnab240/ocorrencia-table'
import { SICREDI_CNAB400_OCORRENCIA_TABLE } from '@cnab/bank/sicredi/cnab/cnab400/ocorrencia-table'
import { SICOOB_CNAB240_OCORRENCIA_TABLE } from '@cnab/bank/sicoob/cnab/cnab240/ocorrencia-table'
import { SICOOB_CNAB400_OCORRENCIA_TABLE } from '@cnab/bank/sicoob/cnab/cnab400/ocorrencia-table'
import { BANCO_DO_BRASIL_CNAB240_OCORRENCIA_TABLE } from '@cnab/bank/banco-do-brasil/cnab/cnab240/ocorrencia-table'

export const CNAB_OCORRENCIA_TABLES: Partial<Record<CnabBank, Partial<Record<CnabFormat, CnabOcorrenciaTable>>>> = {
  [CnabBank.BRADESCO]: {
    [CnabFormat.CNAB240]: BRADESCO_CNAB240_OCORRENCIA_TABLE,
    [CnabFormat.CNAB400]: BRADESCO_CNAB400_OCORRENCIA_TABLE
  },
  [CnabBank.CAIXA]: {
    [CnabFormat.CNAB240]: CAIXA_CNAB240_OCORRENCIA_TABLE,
    [CnabFormat.CNAB400]: CAIXA_CNAB400_OCORRENCIA_TABLE
  },
  [CnabBank.ITAU]: {
    [CnabFormat.CNAB240]: ITAU_CNAB240_OCORRENCIA_TABLE,
    [CnabFormat.CNAB400]: ITAU_CNAB400_OCORRENCIA_TABLE
  },
  [CnabBank.SANTANDER]: {
    [CnabFormat.CNAB240]: SANTANDER_CNAB240_OCORRENCIA_TABLE,
    [CnabFormat.CNAB400]: SANTANDER_CNAB400_OCORRENCIA_TABLE
  },
  [CnabBank.SICREDI]: {
    [CnabFormat.CNAB240]: SICREDI_CNAB240_OCORRENCIA_TABLE,
    [CnabFormat.CNAB400]: SICREDI_CNAB400_OCORRENCIA_TABLE
  },
  [CnabBank.SICOOB]: {
    [CnabFormat.CNAB240]: SICOOB_CNAB240_OCORRENCIA_TABLE,
    [CnabFormat.CNAB400]: SICOOB_CNAB400_OCORRENCIA_TABLE
  },
  [CnabBank.BANCODOBRASIL]: {
    [CnabFormat.CNAB240]: BANCO_DO_BRASIL_CNAB240_OCORRENCIA_TABLE
  }
}

export function getOcorrencia(bank: CnabBank, format: CnabFormat, code: string): CnabOcorrencia | null {
  const table = CNAB_OCORRENCIA_TABLES[bank]?.[format]
  if (table == null) return null
  return findOcorrencia(table, code)?.ocorrencia ?? CnabOcorrencia.OUTRA
}

export function getOcorrenciaDescription(bank: CnabBank, format: CnabFormat, code: string): string | null {
  const table = CNAB_OCORRENCIA_TABLES[bank]?.[format]
  if (table == null) return null
  return findOcorrencia(table, code)?.description ?? null
}
