import { describe, it, expect } from '@jest/globals'
import * as fs from 'fs'
import * as path from 'path'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabInvalidLineSizeError } from '@cnab/type/cnab-validation-error'
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
    ['bradesco/cnab240/bradesco_cnab_240.txt', 'bradesco', '240', 16, 3],
    ['bradesco/cnab400/bradesco_cnab_400.txt', 'bradesco', '400', 76, 37]
  ])(
    'given document file when opening then detects bank, format, lines and boleto count',
    async (
      examplePath: string,
      expectedBank: string,
      expectedFormat: string,
      expectedLineCount: number,
      expectedBoletoCount: number
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
      expect(cnabFile.boletoCount).toBe(expectedBoletoCount)
      expect(cnabFile.schema).not.toBeNull()
    }
  )

  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt'],
    ['bradesco/cnab400/bradesco_cnab_400.txt']
  ])(
    'given valid document file when validating with feedback then reports no errors',
    async (examplePath: string): Promise<void> => {
      // Given
      const fullPath = path.join(resPath(), examplePath)
      const file = createFileFromPath(fullPath)
      const cnabFile = await CnabFile.open(file)

      // When
      const result = cnabFile.validate(true)

      // Then
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
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

  it.each([
    ['banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', 3],
    ['bradesco/cnab240/bradesco_cnab_240.txt', 3],
    ['bradesco/cnab400/bradesco_cnab_400.txt', 37],
    ['caixa/cnab240/caixa_cnab_240.txt', 3],
    ['itau/cnab240/itau_cnab_240.txt', 4],
    ['santander/cnab240/santander_cnab_240.txt', 3],
    ['sicoob/cnab240/sicoob_cnab_240.txt', 3],
    ['sicredi/cnab240/sicredi_cnab_240.txt', 3]
  ])(
    'given valid document file from any bank when opening and validating then reports the right boleto count and no errors',
    (examplePath: string, expectedBoletoCount: number): void => {
      // Given
      const cnabFile = openExample(examplePath)

      // When
      const result = cnabFile.validate(true)

      // Then
      expect(cnabFile.boletoCount).toBe(expectedBoletoCount)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    }
  )
})
