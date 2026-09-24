import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { CnabBoleto } from '@cnab/type/cnab-boleto'
import { CnabLineData } from '@cnab/type/cnab-line-data'
import { Cnab240BradescoBoletoNomeField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-nome-field'
import { Cnab240BradescoBoletoValorTituloField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-valor-titulo-field'
import { readExampleLines, resPath, findFirstCnab240SegmentLine, realLineNumber } from '@test/test-utils'

describe('CnabBoleto', (): void => {
  const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

  function buildBoleto(): CnabBoleto {
    const lines = readExampleLines(path.join(resPath(), examplePath))
    const segmentPLine = findFirstCnab240SegmentLine(lines, 'P')
    const segmentQLine = findFirstCnab240SegmentLine(lines, 'Q')

    if (segmentPLine == null || segmentQLine == null) {
      assert.fail('Linhas de segmento P ou Q não encontradas')
    }

    const segmentPLineNumber = realLineNumber(lines, segmentPLine)
    const segmentQLineNumber = realLineNumber(lines, segmentQLine)

    const segmentP = new CnabLineData({
      rawLine: segmentPLine,
      lineNumber: segmentPLineNumber,
      fields: [new Cnab240BradescoBoletoValorTituloField(segmentPLine, segmentPLineNumber)]
    })

    const segmentQ = new CnabLineData({
      rawLine: segmentQLine,
      lineNumber: segmentQLineNumber,
      fields: [new Cnab240BradescoBoletoNomeField(segmentQLine, segmentQLineNumber)]
    })

    return new CnabBoleto([segmentP, segmentQ])
  }

  describe('access to a field owned by any of its lines', (): void => {
    it('given a field declared on the first line when reading it dynamically then returns its parsed value', (): void => {
      // Given
      const boleto = buildBoleto()

      // When / Then
      expect(boleto['valor do título']).toBe(100)
    })

    it('given a field declared on a later line when reading it dynamically then still returns its parsed value', (): void => {
      // Given
      const boleto = buildBoleto()

      // When / Then
      expect(boleto['nome do sacado']).toBe('JOAO EXEMPLO SILVA')
    })

    it('given a field owned by one of its lines when checking hasField then returns true', (): void => {
      // Given
      const boleto = buildBoleto()

      // Then
      expect(boleto.hasField('nome do sacado')).toBe(true)
      expect('nome do sacado' in boleto).toBe(true)
    })
  })

  describe('access to an unknown field', (): void => {
    it('given an unregistered field name when reading it dynamically then throws', (): void => {
      // Given
      const boleto = buildBoleto()

      // When / Then
      expect(() => boleto['campo inexistente']).toThrow(/Campo desconhecido/)
    })

    it('given an unregistered field name when checking hasField then returns false', (): void => {
      // Given
      const boleto = buildBoleto()

      // Then
      expect(boleto.hasField('campo inexistente')).toBe(false)
      expect('campo inexistente' in boleto).toBe(false)
    })
  })

  describe('read-only behavior', (): void => {
    it('given an attempt to set a property when writing then throws', (): void => {
      // Given
      const boleto = buildBoleto()

      // When / Then
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(boleto as any)['nome do sacado'] = 'outro nome'
      }).toThrow(/somente leitura/)
    })
  })

  describe('metadata', (): void => {
    it('given a boleto with two lines when reading lineCount then returns the number of lines', (): void => {
      // Given
      const boleto = buildBoleto()

      // Then
      expect(boleto.lineCount).toBe(2)
    })

    it('given a boleto when reading lines then exposes the underlying CnabLineData in order', (): void => {
      // Given
      const boleto = buildBoleto()

      // Then
      expect(boleto.lines).toHaveLength(2)
      expect(boleto.lines[0].hasField('valor do título')).toBe(true)
      expect(boleto.lines[1].hasField('nome do sacado')).toBe(true)
    })
  })

  describe('field name collision across lines', (): void => {
    it('given two lines declaring the same field name when reading it then returns the first line that owns it', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const segmentPLine = findFirstCnab240SegmentLine(lines, 'P')

      if (segmentPLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, segmentPLine)
      const firstLine = new CnabLineData({
        rawLine: segmentPLine,
        lineNumber,
        fields: [new Cnab240BradescoBoletoValorTituloField(segmentPLine, lineNumber)]
      })
      const secondLine = new CnabLineData({
        rawLine: segmentPLine,
        lineNumber,
        fields: [new Cnab240BradescoBoletoValorTituloField(segmentPLine, lineNumber)]
      })

      // When
      const boleto = new CnabBoleto([firstLine, secondLine])

      // Then
      expect(boleto['valor do título']).toBe(100)
    })
  })
})
