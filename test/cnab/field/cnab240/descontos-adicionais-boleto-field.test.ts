import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab240SegmentLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { DescontosAdicionaisBoletoField } from '@cnab/field/cnab240/descontos-adicionais-boleto-field'

class BradescoDescontosAdicionaisBoletoField extends DescontosAdicionaisBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}

function segmentoR(descontos: string): string {
  const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')), 'R')
  assert(line != null, 'Linha não encontrada')
  return replaceLineRange(line, [18, 65], descontos)
}

describe('DescontosAdicionaisBoletoField', (): void => {
  it('given only the second desconto filled when reading then returns a list with it alone', (): void => {
    // Given
    const field = new BradescoDescontosAdicionaisBoletoField(segmentoR('1' + '10122026' + '000000000000500' + '0' + '00000000' + '000000000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual([{ codigo: '1', data: new Date(2026, 11, 10), valor: 5 }])
  })

  it('given both descontos filled with zeros when reading then returns null', (): void => {
    // Given
    const field = new BradescoDescontosAdicionaisBoletoField(segmentoR('0'.repeat(48)), 5)

    // When
    const descontos = field.value

    // Then
    expect(descontos).toBeNull()
  })

  it('given a code outside the bank table when validating then reports the error at the range of that code', (): void => {
    // Given
    const field = new BradescoDescontosAdicionaisBoletoField(segmentoR('1' + '10122026' + '000000000000500' + '9' + '12122026' + '000000000000300'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result.isValid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatchObject({ fieldKey: 'descontos', range: [42, 42] })
  })

  it('given a malformed date in the third desconto when validating then reports the error at the range of that date', (): void => {
    // Given
    const field = new BradescoDescontosAdicionaisBoletoField(segmentoR('1' + '10122026' + '000000000000500' + '1' + '31132026' + '000000000000300'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result.isValid).toBe(false)
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toMatchObject({ fieldKey: 'descontos', range: [43, 50] })
  })

  it('given descontos read from a previous line when reading the next one then appends its descontos', (): void => {
    // Given
    const previous = [{ codigo: '1', data: new Date(2026, 11, 5), valor: 10 }]
    const field = new BradescoDescontosAdicionaisBoletoField(segmentoR('1' + '10122026' + '000000000000500' + '0'.repeat(24)), 5)

    // When
    const descontos = field.handleDuplicatedValue(previous)

    // Then
    expect(descontos).toEqual([...previous, { codigo: '1', data: new Date(2026, 11, 10), valor: 5 }])
  })
})
