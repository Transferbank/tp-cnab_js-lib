import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { CnabRetornoFile } from '@cnab/type/cnab-retorno-file'
import { CnabBankSchemaNotFoundException, CnabFileTypeNotSupportedException } from '@cnab/exception/cnab-exception'
import { readExampleLines, replaceLineRange, resPath } from '@test/test-utils'

describe('cnab-retorno-file', (): void => {
  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt'],
    ['itau/cnab400/ITAU_cnab_400.REM']
  ])('given remessa file %s when opening then refuses it as a file type not supported', (examplePath: string): void => {
    // Given
    const rawLines = readExampleLines(path.join(resPath(), examplePath))

    // When
    const open = (): CnabRetornoFile => CnabRetornoFile.fromLines(rawLines)

    // Then
    expect(open).toThrow(CnabFileTypeNotSupportedException)
  })

  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt', [143, 143] as [number, number]],
    ['itau/cnab400/ITAU_cnab_400.REM', [2, 2] as [number, number]]
  ])('given return file %s of a bank without return schema when opening then refuses it as schema not found', (examplePath: string, fileTypeRange: [number, number]): void => {
    // Given
    const rawLines = readExampleLines(path.join(resPath(), examplePath))
    rawLines[0] = replaceLineRange(rawLines[0], fileTypeRange, '2')

    // When
    const open = (): CnabRetornoFile => CnabRetornoFile.fromLines(rawLines)

    // Then
    expect(open).toThrow(CnabBankSchemaNotFoundException)
  })
})
