import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { getFieldRange, readExampleLines, replaceLineRange, resPath, findFirstCnab400RecordLine } from '@test/test-utils'
import { ParcelaBoletoField } from '@cnab/field/cnab400/parcela-boleto-field'
import { TotalDeParcelasBoletoField } from '@cnab/field/cnab400/total-de-parcelas-boleto-field'
import { SeuNumeroBoletoField } from '@cnab/field/cnab400/seu-numero-boleto-field'
import { UsoDaEmpresaBoletoField } from '@cnab/field/cnab400/uso-da-empresa-boleto-field'

const lines = readExampleLines(path.join(resPath(), 'itau/cnab400/ITAU_cnab_400.REM'))

function lineWith(usoDaEmpresa: string, seuNumero: string): string {
  const line = findFirstCnab400RecordLine(lines, '1')
  assert(line != null, 'Linha do boleto não encontrada')
  return replaceLineRange(
    replaceLineRange(line, getFieldRange(UsoDaEmpresaBoletoField), usoDaEmpresa),
    getFieldRange(SeuNumeroBoletoField),
    seuNumero
  )
}

describe('ParcelaBoletoField', (): void => {
  it('given a line that is not the detail record when checking shouldValidate then returns false', (): void => {
    // Given
    const line = findFirstCnab400RecordLine(lines, '0')
    assert(line != null, 'Linha não encontrada')

    // When
    const shouldValidate = new ParcelaBoletoField(line, 1).shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })

  describe.each([
    { usoDaEmpresa: '12.345678.10', seuNumero: 'XX123456-1', expectedParcela: 10, expectedTotal: null, description: 'seu número cut by the field size, parcela taken from the uso da empresa' },
    { usoDaEmpresa: '123456', seuNumero: '12345 1/3', expectedParcela: 1, expectedTotal: 3, description: 'parcela and total in the seu número' }
  ])('given $description', ({ usoDaEmpresa, seuNumero, expectedParcela, expectedTotal }): void => {
    it('when reading then returns the parcela and the total as numbers', (): void => {
      // Given
      const line = lineWith(usoDaEmpresa, seuNumero)
      const parcela = new ParcelaBoletoField(line, 5)
      const total = new TotalDeParcelasBoletoField(line, 5)

      // When
      const results = [parcela.validate(), total.validate()]

      // Then
      expect(results).toEqual([{ isValid: true, errors: [] }, { isValid: true, errors: [] }])
      expect(parcela.value).toBe(expectedParcela)
      expect(total.value).toBe(expectedTotal)
    })
  })
})
