import { describe, it, expect } from '@jest/globals'
import * as path from 'path'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabValidationFailedException } from '@cnab/exception/cnab-exception'
import { readExampleLines, resPath } from '@test/test-utils'

describe('CnabFile.read()', (): void => {
  const cnab240Path = path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')
  const cnab400Path = path.join(resPath(), 'bradesco/cnab400/bradesco_cnab_400.txt')

  describe('given a valid CNAB 240 file', (): void => {
    it('returns header, trailer and all boletos', (): void => {
      // Given
      const lines = readExampleLines(cnab240Path)
      const cnabFile = CnabFile.fromLines(lines)

      // When
      const cnab = cnabFile.read()

      // Then
      expect(cnab.boletos).toHaveLength(3)
      expect(cnab.header.rawLine).toHaveLength(240)
      expect(cnab.header.lineNumber).toBe(0)
      expect(cnab.trailer.rawLine).toHaveLength(240)
      expect(cnab.trailer.lineNumber).toBe(lines.length - 1)
    })

    it('exposes parsed field values on the boleto via bracket access', (): void => {
      // Given
      const cnabFile = CnabFile.fromLines(readExampleLines(cnab240Path))

      // When
      const boleto = cnabFile.read().boletos[0]

      // Then
      expect(boleto['nome do sacado']).toBe('JOAO EXEMPLO SILVA')
      expect(boleto['valor do título']).toBe(100)
      expect(boleto['data de vencimento']).toEqual(new Date(2026, 11, 15))
      expect(boleto['documento do sacado']).toBe('000010000791989')
    })

    it('given an unknown field name when reading it from the boleto then throws listing the available fields', (): void => {
      // Given
      const boleto = CnabFile.fromLines(readExampleLines(cnab240Path)).read().boletos[0]

      // When / Then
      expect(() => boleto['campo que nao existe']).toThrow(/Campo desconhecido/)
    })

    it('given the boleto when trying to write a field then throws', (): void => {
      // Given
      const boleto = CnabFile.fromLines(readExampleLines(cnab240Path)).read().boletos[0]

      // When / Then
      expect(() => {
        boleto['nome do sacado'] = 'outro nome'
      }).toThrow(/somente leitura/)
    })

    it('given the header line when reading an unknown field then throws', (): void => {
      // Given
      const cnab = CnabFile.fromLines(readExampleLines(cnab240Path)).read()

      // Then
      expect(cnab.header.fieldNames).toEqual([])
      expect(() => cnab.header['qualquer campo']).toThrow(/Campo desconhecido/)
    })

    it('exposes CnabBoleto helper methods (hasField, lineCount, lines)', (): void => {
      // Given
      const boleto = CnabFile.fromLines(readExampleLines(cnab240Path)).read().boletos[0]

      // Then
      expect(boleto.hasField('nome do sacado')).toBe(true)
      expect(boleto.hasField('campo inexistente')).toBe(false)
      expect(boleto.lineCount).toBe(boleto.lines.length)
      expect(boleto.lineCount).toBeGreaterThan(0)
    })

    it('exposes CnabLineData helper methods (get, getField, fields, fieldNames, toJSON)', (): void => {
      // Given
      const boleto = CnabFile.fromLines(readExampleLines(cnab240Path)).read().boletos[0]
      const line = boleto.lines.find((candidate) => candidate.hasField('nome do sacado'))

      if (line == null) {
        throw new Error('Linha com nome do sacado não encontrada')
      }

      // Then
      expect(line.get('nome do sacado')).toBe('JOAO EXEMPLO SILVA')
      expect(line.getField('nome do sacado')?.value).toBe('JOAO EXEMPLO SILVA')
      expect(line.fieldNames).toContain('nome do sacado')
      expect(line.fields).toHaveLength(line.fieldNames.length)

      const json = line.toJSON()
      expect(json['nome do sacado']).toBe('JOAO EXEMPLO SILVA')
      expect(json._meta).toEqual({ rawLine: line.rawLine, lineNumber: line.lineNumber })
    })
  })

  describe('given a valid CNAB 400 file', (): void => {
    it('returns all boletos with parsed field values', (): void => {
      // Given
      const cnabFile = CnabFile.fromLines(readExampleLines(cnab400Path))

      // When
      const cnab = cnabFile.read()
      const boleto = cnab.boletos[0]

      // Then
      expect(cnab.boletos).toHaveLength(37)
      expect(boleto['nome do sacado']).toBe('COMERCIAL ALFA LTDA')
      expect(boleto['valor do título']).toBe(22560.93)
      expect(boleto['data de vencimento']).toEqual(new Date(2026, 7, 24))
      expect(boleto['documento do sacado']).toBe('20000000997330')
    })
  })

  describe('given an invalid CNAB 240 file', (): void => {
    it('throws CnabValidationFailedException with the validation errors instead of returning data', (): void => {
      // Given
      const lines = readExampleLines(cnab240Path)
      lines[5] = lines[5].substring(0, 5) // mesma truncagem usada no teste de validate()
      const cnabFile = CnabFile.fromLines(lines)

      // When
      let thrown: unknown
      try {
        cnabFile.read()
      } catch (error) {
        thrown = error
      }

      // Then
      expect(thrown).toBeInstanceOf(CnabValidationFailedException)
      expect((thrown as CnabValidationFailedException).errors.length).toBeGreaterThan(0)
    })
  })
})
