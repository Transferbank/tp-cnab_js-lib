import { describe, it, expect } from '@jest/globals'
import * as fs from 'fs'
import * as path from 'path'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabLineData } from '@cnab/type/cnab-line-data'
import { CnabInvalidLineSizeError } from '@cnab/type/cnab-validation-error'
import { CnabValidationFailedException } from '@cnab/exception/cnab-exception'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { readExampleLines, resPath } from '@test/test-utils'

function createFileFromPath(filePath: string): File {
  const buffer = fs.readFileSync(filePath)
  const blob = new Blob([buffer])
  return new File([blob], path.basename(filePath))
}

describe('cnab-file', (): void => {
  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt', 'bradesco', '240', 16],
    ['bradesco/cnab400/bradesco_cnab_400.txt', 'bradesco', '400', 76]
  ])(
    'given document file when opening then detects bank, format and lines',
    async (
      examplePath: string,
      expectedBank: string,
      expectedFormat: string,
      expectedLineCount: number
    ): Promise<void> => {
      // Given
      const fullPath = path.join(resPath(), examplePath)
      const file = createFileFromPath(fullPath)

      // When
      const cnabFile = await CnabFile.open(file)

      // Then
      expect(cnabFile.bank).toBe(expectedBank)
      expect(cnabFile.format).toBe(expectedFormat)
      expect(cnabFile.rawLines.length).toBe(expectedLineCount)
      expect(cnabFile.schema).not.toBeNull()
    }
  )

  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt'],
    ['bradesco/cnab400/bradesco_cnab_400.txt']
  ])(
    'given valid document file when validating then reports no errors',
    async (examplePath: string): Promise<void> => {
      // Given
      const fullPath = path.join(resPath(), examplePath)
      const file = createFileFromPath(fullPath)
      const cnabFile = await CnabFile.open(file)
      const expectedResult = genValidCnabValidationResult()

      // When
      const result = cnabFile.validate(true)

      // Then
      expect(result).toEqual(expectedResult)
    }
  )

  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt', 5, 240],
    ['bradesco/cnab400/bradesco_cnab_400.txt', 2, 400]
  ])(
    'given document file with truncated line when validating then reports line size error',
    (examplePath: string, truncatedLineNumber: number, expectedSize: number): void => {
      // Given
      const truncatedSize = 5
      const fullPath = path.join(resPath(), examplePath)
      const rawLines = readExampleLines(fullPath)
      rawLines[truncatedLineNumber] = rawLines[truncatedLineNumber].substring(0, truncatedSize)

      const cnabFile = CnabFile.fromLines(rawLines)
      const expectedErrors = [
        new CnabInvalidLineSizeError({
          lineNumber: truncatedLineNumber,
          expectedSize,
          actualSize: truncatedSize
        })
      ]

      // When
      const result = cnabFile.validate(true)

      // Then
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(expectedErrors)
    }
  )

  describe('read', (): void => {
    it.each([
      ['bradesco/cnab240/bradesco_cnab_240.txt', 240, 3],
      ['bradesco/cnab400/bradesco_cnab_400.txt', 400, 37]
    ])(
      'given valid document file when reading then returns header, trailer and boletos',
      (examplePath: string, expectedLineLength: number, expectedBoletoCount: number): void => {
        // Given
        const fullPath = path.join(resPath(), examplePath)
        const rawLines = readExampleLines(fullPath)
        const cnabFile = CnabFile.fromLines(rawLines)

        // When
        const cnab = cnabFile.read()

        // Then
        expect(cnab.header.rawLine).toBe(rawLines[0])
        expect(cnab.header.rawLine.length).toBe(expectedLineLength)
        expect(cnab.header.lineNumber).toBe(0)
        expect(cnab.header.fieldNames).toEqual([])

        expect(cnab.trailer.rawLine).toBe(rawLines[rawLines.length - 1])
        expect(cnab.trailer.lineNumber).toBe(rawLines.length - 1)
        expect(cnab.trailer.fieldNames).toEqual([])

        expect(cnab.boletos).toHaveLength(expectedBoletoCount)
      }
    )

    it('given a segment P/Q boleto when reading then exposes its fields via the dynamic Proxy', (): void => {
      // Given
      const fullPath = path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')
      const rawLines = readExampleLines(fullPath)
      const cnabFile = CnabFile.fromLines(rawLines)

      // When
      const cnab = cnabFile.read()
      const firstBoleto = cnab.boletos[0]

      // Then
      expect(firstBoleto['nome do sacado']).toBe('JOAO EXEMPLO SILVA')
      expect(firstBoleto['valor do título']).toBe(100)
      expect(firstBoleto['data de vencimento']).toEqual(new Date(2026, 11, 15))
      expect(firstBoleto['documento do sacado']).toBe('000010000791989')
      expect(firstBoleto.lineCount).toBe(4)
    })

    it('given a boleto when reading a field through getField then returns the underlying field instance', (): void => {
      // Given
      const fullPath = path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')
      const rawLines = readExampleLines(fullPath)
      const cnabFile = CnabFile.fromLines(rawLines)

      // When
      const cnab = cnabFile.read()
      const nameLine = cnab.boletos[0].lines.find((line: CnabLineData) => line.hasField('nome do sacado'))

      // Then
      if (nameLine == null) {
        throw new Error('Nenhuma linha do primeiro boleto declara o campo nome do sacado')
      }
      expect(nameLine.get<string>('nome do sacado')).toBe('JOAO EXEMPLO SILVA')
    })

    it('given a boleto when reading an unknown field then throws', (): void => {
      // Given
      const fullPath = path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')
      const rawLines = readExampleLines(fullPath)
      const cnabFile = CnabFile.fromLines(rawLines)
      const cnab = cnabFile.read()

      // When / Then
      expect(() => cnab.boletos[0]['campo inexistente']).toThrow(/Campo desconhecido/)
    })

    it.each([
      ['bradesco/cnab240/bradesco_cnab_240.txt', 5, 240],
      ['bradesco/cnab400/bradesco_cnab_400.txt', 2, 400]
    ])(
      'given document file with truncated line when reading then throws with the validation errors',
      (examplePath: string, truncatedLineNumber: number, expectedSize: number): void => {
        // Given
        const truncatedSize = 5
        const fullPath = path.join(resPath(), examplePath)
        const rawLines = readExampleLines(fullPath)
        rawLines[truncatedLineNumber] = rawLines[truncatedLineNumber].substring(0, truncatedSize)

        const cnabFile = CnabFile.fromLines(rawLines)
        const expectedErrors = [
          new CnabInvalidLineSizeError({
            lineNumber: truncatedLineNumber,
            expectedSize,
            actualSize: truncatedSize
          })
        ]

        // When
        let caughtError: unknown
        try {
          cnabFile.read()
        } catch (error) {
          caughtError = error
        }

        // Then
        expect(caughtError).toBeInstanceOf(CnabValidationFailedException)
        expect((caughtError as CnabValidationFailedException).errors).toEqual(expectedErrors)
      }
    )
  })
})
