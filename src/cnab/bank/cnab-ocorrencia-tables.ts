import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabOcorrencia, CnabOcorrenciaTable, findOcorrencia } from '@cnab/type/cnab-ocorrencia'

export const CNAB_OCORRENCIA_TABLES: Partial<Record<CnabBank, Partial<Record<CnabFormat, CnabOcorrenciaTable>>>> = {}

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
