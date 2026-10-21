import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { getFieldRange, readExampleLines, replaceLineRange, resPath, findFirstCnab400RecordLine } from '@test/test-utils'
import { Cnab400BoletoParcelaField } from '@cnab/field/cnab400/boleto-parcela-field'
import { Cnab400BoletoTotalDeParcelasField } from '@cnab/field/cnab400/boleto-total-de-parcelas-field'
import { Cnab400BoletoSeuNumeroField } from '@cnab/field/cnab400/boleto-seu-numero-field'
import { Cnab400BoletoUsoDaEmpresaField } from '@cnab/field/cnab400/boleto-uso-da-empresa-field'

class ParcelaSemUsoDaEmpresaField extends Cnab400BoletoParcelaField {
  protected readonly usoDaEmpresaRange: [number, number] | null = null
}

const lines = readExampleLines(path.join(resPath(), 'itau/cnab400/ITAU_cnab_400.REM'))

function lineWith(usoDaEmpresa: string, seuNumero: string): string {
  const line = findFirstCnab400RecordLine(lines, '1')
  assert(line != null, 'Linha do boleto não encontrada')
  return replaceLineRange(
    replaceLineRange(line, getFieldRange(Cnab400BoletoUsoDaEmpresaField), usoDaEmpresa),
    getFieldRange(Cnab400BoletoSeuNumeroField),
    seuNumero
  )
}

describe('Cnab400BoletoParcelaField', (): void => {
  it('given a line that is not the detail record when checking shouldValidate then returns false', (): void => {
    // Given
    const line = findFirstCnab400RecordLine(lines, '0')
    assert(line != null, 'Linha não encontrada')

    // When
    const shouldValidate = new Cnab400BoletoParcelaField(line, 1).shouldValidate()

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
      const parcela = new Cnab400BoletoParcelaField(line, 5)
      const total = new Cnab400BoletoTotalDeParcelasField(line, 5)

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
    const field = new ParcelaSemUsoDaEmpresaField(lineWith('PED1234-2/4', '12345 1/3'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(1)
  })
})
