import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { CnabLineData } from '@cnab/type/cnab-line-data'
import { Cnab240BradescoBoletoValorTituloField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-valor-titulo-field'
import { Cnab240BradescoBoletoVencimentoField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-vencimento-field'
import { readExampleLines, resPath, findFirstCnab240SegmentLine, realLineNumber } from '@test/test-utils'

describe('CnabLineData', (): void => {
  const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

  function buildLineData(): CnabLineData {
    const lines = readExampleLines(path.join(resPath(), examplePath))
    const rawLine = findFirstCnab240SegmentLine(lines, 'P')

    if (rawLine == null) {
      assert.fail('Linha segmento P não encontrada')
    }

    const lineNumber = realLineNumber(lines, rawLine)
    const valorField = new Cnab240BradescoBoletoValorTituloField(rawLine, lineNumber)

    return new CnabLineData({
      rawLine,
      lineNumber,
      fields: [valorField]
    })
  }

  describe('access to a registered field', (): void => {
    it('given a registered field when reading it dynamically then returns its parsed value', (): void => {
      // Given
      const lineData = buildLineData()

      // When
      const value = lineData['valor do título']

      // Then
      expect(value).toBe(100)
    })

    it('given a registered field when reading it via getField then returns the field instance', (): void => {
      // Given
      const lineData = buildLineData()

      // When
      const field = lineData.getField<number>('valor do título')

      // Then
      expect(field).toBeInstanceOf(Cnab240BradescoBoletoValorTituloField)
      expect(field?.value).toBe(100)
    })

    it('given a registered field when reading it via get then returns its parsed value', (): void => {
      // Given
      const lineData = buildLineData()

      // When
      const value = lineData.get<number>('valor do título')

      // Then
      expect(value).toBe(100)
    })

    it('given a registered field when checking hasField then returns true', (): void => {
      // Given
      const lineData = buildLineData()

      // Then
      expect(lineData.hasField('valor do título')).toBe(true)
      expect('valor do título' in lineData).toBe(true)
    })
  })

  describe('access to an unknown field', (): void => {
    it('given an unregistered field name when reading it dynamically then throws', (): void => {
      // Given
      const lineData = buildLineData()

      // When / Then
      expect(() => lineData['campo inexistente']).toThrow(/Campo desconhecido/)
    })

    it('given an unregistered field name when reading it via getField then returns undefined', (): void => {
      // Given
      const lineData = buildLineData()

      // When
      const field = lineData.getField('campo inexistente')

      // Then
      expect(field).toBeUndefined()
    })

    it('given an unregistered field name when checking hasField then returns false', (): void => {
      // Given
      const lineData = buildLineData()

      // Then
      expect(lineData.hasField('campo inexistente')).toBe(false)
      expect('campo inexistente' in lineData).toBe(false)
    })
  })

  describe('read-only behavior', (): void => {
    it('given an attempt to set a property when writing then throws', (): void => {
      // Given
      const lineData = buildLineData()

      // When / Then
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(lineData as any)['valor do título'] = 999
      }).toThrow(/somente leitura/)
    })
  })

  describe('metadata and introspection', (): void => {
    it('given a line data when reading fieldNames then lists the registered fields', (): void => {
      // Given
      const lineData = buildLineData()

      // Then
      expect(lineData.fieldNames).toEqual(['valor do título'])
    })

    it('given a line data when reading fields then lists the field instances', (): void => {
      // Given
      const lineData = buildLineData()

      // Then
      expect(lineData.fields).toHaveLength(1)
      expect(lineData.fields[0]).toBeInstanceOf(Cnab240BradescoBoletoValorTituloField)
    })

    it('given a line data when serializing to JSON then includes meta and field values', (): void => {
      // Given
      const lineData = buildLineData()

      // When
      const json = lineData.toJSON()

      // Then
      expect(json).toEqual({
        _meta: {
          rawLine: lineData.rawLine,
          lineNumber: lineData.lineNumber
        },
        'valor do título': 100
      })
    })
  })

  describe('multiple fields on the same line', (): void => {
    it('given a line data built with two fields when reading each then returns each parsed value independently', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const valorField = new Cnab240BradescoBoletoValorTituloField(rawLine, lineNumber)
      const vencimentoField = new Cnab240BradescoBoletoVencimentoField(rawLine, lineNumber)

      // When
      const lineData = new CnabLineData({
        rawLine,
        lineNumber,
        fields: [valorField, vencimentoField]
      })

      // Then
      expect(lineData['valor do título']).toBe(100)
      expect(lineData['data de vencimento']).toEqual(new Date(2026, 11, 15))
      expect(lineData.fieldNames).toEqual(['valor do título', 'data de vencimento'])
    })
  })
})
