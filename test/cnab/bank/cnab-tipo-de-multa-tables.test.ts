import { describe, it, expect } from '@jest/globals'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabTipoDeMulta } from '@cnab/type/cnab-tipo-de-multa'
import { getTipoDeMulta } from '@cnab/bank/cnab-tipo-de-multa-tables'

describe('getTipoDeMulta', (): void => {
  it.each([
    ['a code table and no code', CnabBank.BRADESCO, CnabFormat.CNAB240, null, null],
    ['a code in the table', CnabBank.BRADESCO, CnabFormat.CNAB400, '2', CnabTipoDeMulta.PERCENTUAL],
    ['a code table with a default and no code', CnabBank.SICREDI, CnabFormat.CNAB400, null, CnabTipoDeMulta.PERCENTUAL],
    ['a layout without code', CnabBank.CAIXA, CnabFormat.CNAB400, null, CnabTipoDeMulta.VALOR_FIXO]
  ])('given %s when resolving then returns the expected tipo', (_: string, bank: CnabBank, format: CnabFormat, codigo: string | null, expected: CnabTipoDeMulta | null): void => {
    // When
    const tipo = getTipoDeMulta(bank, format, codigo)

    // Then
    expect(tipo).toBe(expected)
  })
})
