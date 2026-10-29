import { describe, it, expect } from '@jest/globals'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabTipoDeJuros } from '@cnab/type/cnab-tipo-de-juros'
import { getTipoDeJuros } from '@cnab/bank/cnab-tipo-de-juros-tables'

describe('getTipoDeJuros', (): void => {
  it.each([
    ['a layout with codes and the code not informed', CnabBank.BRADESCO, CnabFormat.CNAB240, null, null],
    ['a code in the table', CnabBank.SICOOB, CnabFormat.CNAB240, '0', CnabTipoDeJuros.ISENTO],
    ['a letter code', CnabBank.SICREDI, CnabFormat.CNAB400, 'B', CnabTipoDeJuros.TAXA_DIARIA],
    ['a layout without code', CnabBank.SICOOB, CnabFormat.CNAB400, null, CnabTipoDeJuros.TAXA_MENSAL]
  ])('given %s when resolving then returns the expected tipo', (_: string, bank: CnabBank, format: CnabFormat, codigo: string | null, expected: CnabTipoDeJuros | null): void => {
    // When
    const tipo = getTipoDeJuros(bank, format, codigo)

    // Then
    expect(tipo).toBe(expected)
  })
})
