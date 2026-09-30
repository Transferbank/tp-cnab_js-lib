import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, resPath } from '@test/test-utils'
import { Cnab240BoletoGroupRule } from '@cnab/group-rule/cnab240/boleto-group-rule'
import { CnabGroupDuplicateSegmentError, CnabGroupMissingSegmentError } from '@cnab/type/cnab-validation-error'

describe('Cnab240BoletoGroupRule', (): void => {
  it.each([
    ['banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt'],
    ['bradesco/cnab240/bradesco_cnab_240.txt'],
    ['caixa/cnab240/caixa_cnab_240.txt'],
    ['itau/cnab240/itau_cnab_240.txt'],
    ['santander/cnab240/santander_cnab_240.txt'],
    ['sicoob/cnab240/sicoob_cnab_240.txt'],
    ['sicredi/cnab240/sicredi_cnab_240.txt']
  ])(
    'given doc lines from %s when checking group start then marks only segment P lines',
    (examplePath: string): void => {
      // Given
      const isSegmentoP = (line: string): boolean =>
        line.length > 13 && line[7] === '3' && line[13] === 'P'
      const rawLines = readExampleLines(path.join(resPath(), examplePath))
      const expectedGroupStarts = rawLines.map(isSegmentoP)

      // When
      const groupRule = new Cnab240BoletoGroupRule()
      const groupStarts = rawLines.map((line: string) => groupRule.check(line))

      // Then
      expect(expectedGroupStarts.some(Boolean)).toBe(true)
      expect(groupStarts).toEqual(expectedGroupStarts)
    }
  )

  describe('validate', (): void => {
    const rawLines = readExampleLines(path.join(resPath(), 'itau/cnab240/itau_cnab_240.txt'))
    const segmentoP = rawLines[4]
    const segmentoQ = rawLines[5]
    const segmentoR = rawLines[6]

    it.each([
      ['P e Q', [segmentoP, segmentoQ]],
      ['P, Q e R', [segmentoP, segmentoQ, segmentoR]]
    ])('given boleto group with segments %s when validating then accepts it', (_: string, lines: string[]): void => {
      // Given
      const group = lines.map((line: string, index: number): [number, string] => [10 + index, line])

      // When
      const result = new Cnab240BoletoGroupRule().validate(group)

      // Then
      expect(result).toEqual({ isValid: true, errors: [] })
    })

    it('given empty group when validating then accepts it', (): void => {
      // When
      const result = new Cnab240BoletoGroupRule().validate([])

      // Then
      expect(result).toEqual({ isValid: true, errors: [] })
    })

    it('given boleto group without segment Q when validating then reports missing segment at the group first line', (): void => {
      // Given
      const group: Array<[number, string]> = [[10, segmentoP], [11, segmentoR]]

      // When
      const result = new Cnab240BoletoGroupRule().validate(group)

      // Then
      expect(result).toEqual({
        isValid: false,
        errors: [new CnabGroupMissingSegmentError({ lineNumber: 10, segmentName: 'segmento Q' })]
      })
      expect(result.errors[0].message).toBe('Grupo de boleto incompleto: segmento Q obrigatório não encontrado')
    })

    it.each([
      ['segmento Q', [segmentoP, segmentoQ, segmentoQ]],
      ['segmento R', [segmentoP, segmentoQ, segmentoR, segmentoR]]
    ])('given boleto group with duplicated %s when validating then reports duplicate segment', (segmentName: string, lines: string[]): void => {
      // Given
      const group = lines.map((line: string, index: number): [number, string] => [10 + index, line])

      // When
      const result = new Cnab240BoletoGroupRule().validate(group)

      // Then
      expect(result).toEqual({
        isValid: false,
        errors: [new CnabGroupDuplicateSegmentError({ lineNumber: 10, segmentName, count: 2 })]
      })
    })
  })
})
