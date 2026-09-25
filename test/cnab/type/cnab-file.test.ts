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
    ['bradesco/cnab240/bradesco_cnab_240.txt', 3],
    ['bradesco/cnab400/bradesco_cnab_400.txt', 37]
  ])(
    'given valid document file when validating with feedback then reports no errors and includes the boleto breakdown',
    async (examplePath: string, expectedBoletoCount: number): Promise<void> => {
      // Given
      const fullPath = path.join(resPath(), examplePath)
      const file = createFileFromPath(fullPath)
      const cnabFile = await CnabFile.open(file)

      // When
      const result = cnabFile.validate(true)

      // Then
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
      expect(result.boletos).toHaveLength(expectedBoletoCount)
      expect(result.boletos?.every(boleto => boleto.isValid)).toBe(true)
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

  it('given document file with one invalid boleto when validating with feedback then isolates the invalid boleto in the breakdown', (): void => {
    // Given
    const fullPath = path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')
    const rawLines = readExampleLines(fullPath)
    const truncatedSize = 5
    const truncatedLineNumber = 7 // segunda linha do segundo boleto (índices 6-9)
    rawLines[truncatedLineNumber] = rawLines[truncatedLineNumber].substring(0, truncatedSize)
    const cnabFile = CnabFile.fromLines(rawLines)

    // When
    const result = cnabFile.validate(true)

    // Then
    expect(result.isValid).toBe(false)
    expect(result.boletos).toHaveLength(3)
    expect(result.boletos?.[0].isValid).toBe(true)
    expect(result.boletos?.[1].isValid).toBe(false)
    expect(result.boletos?.[1].errors).toEqual([
      new CnabInvalidLineSizeError({
        lineNumber: truncatedLineNumber,
        expectedSize: 240,
        actualSize: truncatedSize
      })
    ])
    expect(result.boletos?.[2].isValid).toBe(true)
    // O erro do boleto tambem aparece agregado em result.errors, ja que validate()
    // ainda responde "o arquivo inteiro esta ok?" alem da quebra por boleto.
    expect(result.errors).toEqual(result.boletos?.[1].errors)
  })

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
    'given valid document file from any bank when validating with feedback then reports each boleto as valid',
    (examplePath: string, expectedBoletoCount: number): void => {
      // Given
      const cnabFile = openExample(examplePath)

      // When
      const result = cnabFile.validate(true)

      // Then
      expect(cnabFile.boletoCount).toBe(expectedBoletoCount)
      expect(result.boletos).toHaveLength(expectedBoletoCount)
      result.boletos?.forEach((boleto, index) => {
        expect(boleto.index).toBe(index)
        expect(boleto.isValid).toBe(true)
        expect(boleto.errors).toEqual([])
      })
    }
  )

  it('given document file with an invalid boleto when opening then boletoCount is still correct without validating anything', (): void => {
    // Given
    const fullPath = path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')
    const rawLines = readExampleLines(fullPath)
    rawLines[7] = rawLines[7].substring(0, 5)

    // When
    const cnabFile = CnabFile.fromLines(rawLines)

    // Then
    expect(cnabFile.boletoCount).toBe(3)
  })
})
