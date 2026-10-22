import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { getFieldRange, readExampleLines, replaceLineRange, resPath, findFirstCnab240SegmentLine } from '@test/test-utils'
import { Cnab240BoletoParcelaField } from '@cnab/field/cnab240/parcela-boleto-field'
import { Cnab240BoletoTotalDeParcelasField } from '@cnab/field/cnab240/total-de-parcelas-boleto-field'
import { Cnab240BoletoSeuNumeroField } from '@cnab/field/cnab240/seu-numero-boleto-field'
import { Cnab240BoletoUsoDaEmpresaField } from '@cnab/field/cnab240/uso-da-empresa-boleto-field'

const lines = readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt'))

function lineWith(usoDaEmpresa: string, seuNumero: string): string {
  const line = findFirstCnab240SegmentLine(lines, 'P')
  assert(line != null, 'Linha do boleto não encontrada')
  return replaceLineRange(
    replaceLineRange(line, getFieldRange(Cnab240BoletoUsoDaEmpresaField), usoDaEmpresa),
    getFieldRange(Cnab240BoletoSeuNumeroField),
    seuNumero
  )
}

describe('Cnab240BoletoParcelaField', (): void => {
  it('given a line that is not the segment P when checking shouldValidate then returns false', (): void => {
    // Given
    const line = findFirstCnab240SegmentLine(lines, 'Q')
    assert(line != null, 'Linha não encontrada')

    // When
    const shouldValidate = new Cnab240BoletoParcelaField(line, 1).shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })

  describe.each([
    { usoDaEmpresa: 'PED1234-2/4', seuNumero: 'XX12345-01', expectedParcela: 2, expectedTotal: 4, description: 'parcela and total in the uso da empresa' },
    { usoDaEmpresa: '12.345678.01', seuNumero: 'XX123456-0', expectedParcela: 1, expectedTotal: null, description: 'parcela in both fields, taken from the uso da empresa' },
    { usoDaEmpresa: 'XX12345-01', seuNumero: '12345 1/3', expectedParcela: 1, expectedTotal: null, description: 'total only in the seu número, not mixed with the uso da empresa parcela' },
    { usoDaEmpresa: '1234567890', seuNumero: '12345 1/3', expectedParcela: 1, expectedTotal: 3, description: 'parcela and total only in the seu número' },
    { usoDaEmpresa: '123456', seuNumero: '123456', expectedParcela: null, expectedTotal: null, description: 'no parcela in either field' }
  ])('given $description', ({ usoDaEmpresa, seuNumero, expectedParcela, expectedTotal }): void => {
    it('when reading then returns the parcela and the total as numbers', (): void => {
      // Given
      const line = lineWith(usoDaEmpresa, seuNumero)
      const parcela = new Cnab240BoletoParcelaField(line, 5)
      const total = new Cnab240BoletoTotalDeParcelasField(line, 5)

      // When
      const results = [parcela.validate(), total.validate()]

      // Then
      expect(results).toEqual([{ isValid: true, errors: [] }, { isValid: true, errors: [] }])
      expect(parcela.value).toBe(expectedParcela)
      expect(total.value).toBe(expectedTotal)
    })
  })
})
