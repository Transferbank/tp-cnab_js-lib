import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { getFieldRange, readExampleLines, replaceLineRange, resPath, findFirstCnab400RecordLine } from '@test/test-utils'
import { ParcelaBoletoField } from '@cnab/field/cnab400/parcela-boleto-field'
import { TotalDeParcelasBoletoField } from '@cnab/field/cnab400/total-de-parcelas-boleto-field'
import { SeuNumeroBoletoField } from '@cnab/field/cnab400/seu-numero-boleto-field'
import { UsoDaEmpresaBoletoField } from '@cnab/field/cnab400/uso-da-empresa-boleto-field'

class ParcelaSemUsoDaEmpresaBoletoField extends ParcelaBoletoField {
  protected readonly usoDaEmpresaRange: [number, number] | null = null
}

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
    { usoDaEmpresa: 'PED1234-2/4', seuNumero: 'XX12345-01', expectedParcela: 2, expectedTotal: 4, description: 'parcela and total in the uso da empresa' },
    { usoDaEmpresa: '12.345678.10', seuNumero: 'XX123456-1', expectedParcela: 10, expectedTotal: null, description: 'seu número cut by the field size, parcela taken from the uso da empresa' },
    { usoDaEmpresa: 'XX12345-01', seuNumero: '12345 1/3', expectedParcela: 1, expectedTotal: null, description: 'total only in the seu número, not mixed with the uso da empresa parcela' },
    { usoDaEmpresa: '1234567890', seuNumero: '12345 1/3', expectedParcela: 1, expectedTotal: 3, description: 'parcela and total only in the seu número' },
    { usoDaEmpresa: '123456', seuNumero: '123456', expectedParcela: null, expectedTotal: null, description: 'no parcela in either field' }
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

  it('given a layout without uso da empresa when reading then takes the parcela only from the seu número', (): void => {
    // Given
    const field = new ParcelaSemUsoDaEmpresaBoletoField(lineWith('PED1234-2/4', '12345 1/3'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(1)
  })
})
