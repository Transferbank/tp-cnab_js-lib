import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import assert from 'node:assert'
import { findFirstCnab240SegmentLine, readExampleLines, resPath } from '@test/test-utils'
import { Cnab240BoletoGroupRule } from '@cnab/group-rule/cnab240/boleto-group-rule'
import {
  CnabGroupDuplicateSegmentError,
  CnabGroupMissingSegmentError,
  CnabGroupMissingStartSegmentError
} from '@cnab/type/cnab-validation-error'

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
    const segmentoP = findSegment('P')
    const segmentoQ = findSegment('Q')
    const segmentoR = findSegment('R')
    // Número de linha qualquer, usado só para conferir o lineNumber dos erros
    const firstLineNumber = 10
    const toGroup = (lines: string[]): Array<[number, string]> =>
      lines.map((line: string, index: number): [number, string] => [firstLineNumber + index, line])

    it.each([
      ['P and Q', [segmentoP, segmentoQ]],
      ['P, Q and R', [segmentoP, segmentoQ, segmentoR]]
    ])('given boleto group with segments %s when validating then accepts it', (_: string, lines: string[]): void => {
      // Given
      const group = toGroup(lines)

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
      const group = toGroup([segmentoP, segmentoR])

      // When
      const result = new Cnab240BoletoGroupRule().validate(group)

      // Then
      expect(result).toEqual({
        isValid: false,
        errors: [new CnabGroupMissingSegmentError({ lineNumber: firstLineNumber, segmentName: 'segmento Q' })]
      })
      expect(result.errors[0].message).toBe('Grupo de boleto incompleto: segmento Q obrigatório não encontrado')
    })

    it('given boleto group with duplicated optional segment R when validating then reports duplicate segment', (): void => {
      // Given
      const group = toGroup([segmentoP, segmentoQ, segmentoR, segmentoR])

      // When
      const result = new Cnab240BoletoGroupRule().validate(group)

      // Then
      expect(result).toEqual({
        isValid: false,
        errors: [new CnabGroupDuplicateSegmentError({ lineNumber: firstLineNumber, segmentName: 'segmento R', count: 2 })]
      })
    })

    it('given boleto group with extra segment Q when validating then reports each extra Q as missing segment P at its own line', (): void => {
      // Given
      const group = toGroup([segmentoP, segmentoQ, segmentoQ, segmentoR, segmentoQ])

      // When
      const result = new Cnab240BoletoGroupRule().validate(group)

      // Then
      expect(result).toEqual({
        isValid: false,
        errors: [
          new CnabGroupMissingStartSegmentError({ lineNumber: firstLineNumber + 2, segmentName: 'segmento Q', startSegmentName: 'segmento P' }),
          new CnabGroupMissingStartSegmentError({ lineNumber: firstLineNumber + 4, segmentName: 'segmento Q', startSegmentName: 'segmento P' })
        ]
      })
      expect(result.errors[0].message).toBe('Grupo de boleto inválido: segmento Q encontrado sem segmento P antes dele')
    })
  })
})
