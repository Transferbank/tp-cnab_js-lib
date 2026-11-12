import { describe, it, expect } from '@jest/globals'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabEspecieDoTitulo } from '@cnab/type/cnab-especie-do-titulo'
import { getEspecieDoTitulo } from '@cnab/bank/cnab-especie-do-titulo-tables'

describe('getEspecieDoTitulo', (): void => {
  it.each([
    ['the code not informed', CnabBank.ITAU, CnabFormat.CNAB240, null, null],
    ['the same code in different layouts of the same bank', CnabBank.BANCODOBRASIL, CnabFormat.CNAB240, '02', CnabEspecieDoTitulo.DUPLICATA_MERCANTIL],
    ['the same code in different layouts of the same bank', CnabBank.BANCODOBRASIL, CnabFormat.CNAB400, '02', CnabEspecieDoTitulo.NOTA_PROMISSORIA],
    ['a letter code', CnabBank.SICREDI, CnabFormat.CNAB400, 'K', CnabEspecieDoTitulo.OUTRO],
    ['a code outside the table', CnabBank.SANTANDER, CnabFormat.CNAB400, '99', CnabEspecieDoTitulo.OUTRO]
  ])('given %s when resolving then returns the expected especie', (_: string, bank: CnabBank, format: CnabFormat, codigo: string | null, expected: CnabEspecieDoTitulo | null): void => {
    // When
    const especie = getEspecieDoTitulo(bank, format, codigo)

    // Then
    expect(especie).toBe(expected)
  })
})
