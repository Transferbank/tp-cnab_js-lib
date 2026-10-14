import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { CnabRetornoFile } from '@cnab/type/cnab-retorno-file'
import { CnabFileTypeNotSupportedException } from '@cnab/exception/cnab-exception'
import { readExampleLines, resPath } from '@test/test-utils'

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
})
