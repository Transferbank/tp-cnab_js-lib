import { describe, it, expect } from '@jest/globals'
import * as fs from 'fs'
import * as path from 'path'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabInvalidLineSizeError } from '@cnab/type/cnab-validation-error'
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
})
