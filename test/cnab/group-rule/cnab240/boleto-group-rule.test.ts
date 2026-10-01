import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import assert from 'node:assert'
import { findFirstCnab240SegmentLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { Cnab240BoletoGroupRule } from '@cnab/group-rule/cnab240/boleto-group-rule'
import { CnabNumberedLine } from '@cnab/type/cnab-numbered-line'
import { CnabGroupMissingSegmentError } from '@cnab/type/cnab-validation-error'

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
    const findSegment = (segment: string): string => {
      const line = findFirstCnab240SegmentLine(rawLines, segment)
      assert(line != null, `Linha com segmento ${segment} não encontrada`)
      return line
    }
    const segmentoPEntrada = findSegment('P')
    const segmentoPBaixa = replaceLineRange(segmentoPEntrada, [16, 17], '02')
    const segmentoQ = findSegment('Q')
    const segmentoR = findSegment('R')
    const firstLineNumber = 10
    const toGroup = (lines: string[]): CnabNumberedLine[] =>
      lines.map((line: string, index: number): CnabNumberedLine => [firstLineNumber + index, line])

    it.each([
      ['entrada with segment Q', [segmentoPEntrada, segmentoQ]],
      ['entrada with segments Q and R', [segmentoPEntrada, segmentoQ, segmentoR]],
      ['baixa without segment Q', [segmentoPBaixa]],
      ['baixa without segment Q and with segment R', [segmentoPBaixa, segmentoR]]
    ])('given boleto group of %s when validating then accepts it', (_: string, lines: string[]): void => {
      // When
      const result = new Cnab240BoletoGroupRule().validate(toGroup(lines))

      // Then
      expect(result).toEqual({ isValid: true, errors: [] })
    })

    it.each([
      ['without other segments', [segmentoPEntrada]],
      ['with segment R only', [segmentoPEntrada, segmentoR]]
    ])('given boleto group of entrada %s when validating then reports missing segment Q at the segment P', (_: string, lines: string[]): void => {
      // When
      const result = new Cnab240BoletoGroupRule().validate(toGroup(lines))

      // Then
      expect(result).toEqual({
        isValid: false,
        errors: [new CnabGroupMissingSegmentError({ lineNumber: firstLineNumber, segmentName: 'segmento Q' })]
      })
    })
  })
})
