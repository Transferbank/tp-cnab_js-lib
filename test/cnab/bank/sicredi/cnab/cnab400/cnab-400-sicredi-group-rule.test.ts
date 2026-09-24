import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, resPath } from '@test/test-utils'
import { Cnab400SicrediGroupRule } from '@cnab/bank/sicredi/cnab/cnab400/cnab-400-sicredi-group-rule'

describe('Cnab400SicrediGroupRule', (): void => {
  it('given doc lines when checking group start then marks only boleto lines', (): void => {
    // Given
    const examplePath = path.join(resPath(), 'sicredi/cnab400/sicredi_cnab_400.REM')
    const boletoRecordType = '1'
    const rawLines = readExampleLines(examplePath)
    const expectedGroupStarts = rawLines.map((line: string) => line.startsWith(boletoRecordType))

    // When
    const groupRule = new Cnab400SicrediGroupRule()
    const groupStarts = rawLines.map((line: string) => groupRule.check(line))

    // Then
    expect(expectedGroupStarts.some(Boolean)).toBe(true)
    expect(groupStarts).toEqual(expectedGroupStarts)
  })
})
