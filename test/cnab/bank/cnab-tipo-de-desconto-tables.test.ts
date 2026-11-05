import { describe, it, expect } from '@jest/globals'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabTipoDeDesconto } from '@cnab/type/cnab-tipo-de-desconto'
import { getTipoDeDesconto } from '@cnab/bank/cnab-tipo-de-desconto-tables'

describe('getTipoDeDesconto', (): void => {
  it.each([
    ['a layout with codes and the code not informed', CnabBank.BRADESCO, CnabFormat.CNAB240, null, null],
    ['a code 0, which is not a tipo in any table', CnabBank.BANCODOBRASIL, CnabFormat.CNAB240, '0', null],
    ['a code in the table', CnabBank.CAIXA, CnabFormat.CNAB240, '5', CnabTipoDeDesconto.PERCENTUAL_POR_ANTECIPACAO_DIA_CORRIDO],
    ['a code outside the table', CnabBank.BANCODOBRASIL, CnabFormat.CNAB240, '4', CnabTipoDeDesconto.OUTRO],
    ['a layout without code', CnabBank.ITAU, CnabFormat.CNAB400, null, CnabTipoDeDesconto.VALOR_FIXO]
  ])('given %s when resolving then returns the expected tipo', (_: string, bank: CnabBank, format: CnabFormat, codigo: string | null, expected: CnabTipoDeDesconto | null): void => {
    // When
    const tipo = getTipoDeDesconto(bank, format, codigo)

    // Then
    expect(tipo).toBe(expected)
  })
})
