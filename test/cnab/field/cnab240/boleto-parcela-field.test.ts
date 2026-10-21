import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { getFieldRange, readExampleLines, replaceLineRange, resPath, findFirstCnab240SegmentLine } from '@test/test-utils'
import { Cnab240BoletoParcelaField } from '@cnab/field/cnab240/boleto-parcela-field'
import { Cnab240BoletoSeuNumeroField } from '@cnab/field/cnab240/boleto-seu-numero-field'
import { Cnab240BoletoUsoDaEmpresaField } from '@cnab/field/cnab240/boleto-uso-da-empresa-field'

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
    { usoDaEmpresa: '12.345678.01', seuNumero: 'XX123456-0', expected: '1', description: 'parcela in both fields, taken from the uso da empresa' },
    { usoDaEmpresa: '1234567890', seuNumero: '12345 1/3', expected: '1/3', description: 'parcela only in the seu número' },
    { usoDaEmpresa: '123456', seuNumero: '123456', expected: null, description: 'no parcela in either field' }
  ])('given $description', ({ usoDaEmpresa, seuNumero, expected }): void => {
    it('when reading then returns the parcela found', (): void => {
      // Given
      const field = new Cnab240BoletoParcelaField(lineWith(usoDaEmpresa, seuNumero), 5)

      // When
      const result = field.validate()

      // Then
      expect(field.shouldValidate()).toBe(true)
      expect(result).toEqual({ isValid: true, errors: [] })
      expect(field.value).toBe(expected)
    })
  })
})
