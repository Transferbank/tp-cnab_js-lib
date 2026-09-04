import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, resPath } from '@test/test-utils'
import { Cnab400SantanderGroupRule } from '@cnab/bank/santander/cnab/cnab400/cnab-400-santander-group-rule'

describe('Cnab400SantanderGroupRule', (): void => {
  it('given doc lines when checking group start then marks only boleto lines', (): void => {
    // Given
    const examplePath = path.join(resPath(), 'santander/cnab400/santander_cnab_400.REM')
    const boletoRecordType = '1'
    const rawLines = readExampleLines(examplePath)
    const expectedGroupStarts = rawLines.map((line: string) => line.startsWith(boletoRecordType))

    // When
    const groupRule = new Cnab400SantanderGroupRule()
    const groupStarts = rawLines.map((line: string) => groupRule.check(line))

    // Then
    expect(expectedGroupStarts.some(Boolean)).toBe(true)
    expect(groupStarts).toEqual(expectedGroupStarts)
  })
})
