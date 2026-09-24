import { describe, it, expect } from '@jest/globals'
import * as fs from 'fs'
import * as path from 'path'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabInvalidLineSizeError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { readExampleLines, resPath } from '@test/test-utils'

function openExample(examplePath: string): CnabFile {
  const fullPath = path.join(resPath(), examplePath)
  const rawLines = readExampleLines(fullPath)
  return CnabFile.fromLines(rawLines)
}

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

  describe('validateBoletos', (): void => {
    it.each([
      ['banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', 3],
      ['bradesco/cnab240/bradesco_cnab_240.txt', 3],
      ['bradesco/cnab400/bradesco_cnab_400.txt', 37],
      ['caixa/cnab240/caixa_cnab_240.txt', 3],
      ['itau/cnab240/itau_cnab_240.txt', 4],
      ['santander/cnab240/santander_cnab_240.txt', 3],
      // sicoob temporariamente desativado, ver cnab-bank-schemas.ts
      ['sicredi/cnab240/sicredi_cnab_240.txt', 3]
    ])(
      'given valid document file from any bank when validating boletos then reports each boleto as valid',
      (examplePath: string, expectedBoletoCount: number): void => {
        // Given
        const cnabFile = openExample(examplePath)

        // When
        const results = cnabFile.validateBoletos(true)

        // Then
        expect(results).toHaveLength(expectedBoletoCount)
        results.forEach((result, index) => {
          expect(result.index).toBe(index)
          expect(result.isValid).toBe(true)
          expect(result.errors).toEqual([])
        })
      }
    )

    it('given document file with one invalid boleto when validating boletos then reports only that boleto as invalid', (): void => {
      // Given
      const fullPath = path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')
      const rawLines = readExampleLines(fullPath)
      const truncatedSize = 5
      const truncatedLineNumber = 7 // segunda linha do segundo boleto (índices 6-9)
      rawLines[truncatedLineNumber] = rawLines[truncatedLineNumber].substring(0, truncatedSize)
      const cnabFile = CnabFile.fromLines(rawLines)

      // When
      const results = cnabFile.validateBoletos(true)

      // Then
      expect(results).toHaveLength(3)
      expect(results[0].isValid).toBe(true)
      expect(results[1].isValid).toBe(false)
      expect(results[1].errors).toEqual([
        new CnabInvalidLineSizeError({
          lineNumber: truncatedLineNumber,
          expectedSize: 240,
          actualSize: truncatedSize
        })
      ])
      expect(results[2].isValid).toBe(true)
    })
  })
})
