import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, resPath } from '@test/test-utils'
import { Cnab400CaixaGroupRule } from '@cnab/bank/caixa/cnab/cnab400/cnab-400-caixa-group-rule'

describe('Cnab400CaixaGroupRule', (): void => {
  it('given doc lines when checking group start then marks only boleto lines', (): void => {
    // Given
    const examplePath = path.join(resPath(), 'caixa/cnab400/caixa_cnab_400.REM')
    const boletoRecordType = '1'
    const rawLines = readExampleLines(examplePath)
    const expectedGroupStarts = rawLines.map((line: string) => line.startsWith(boletoRecordType))

    // When
    const groupRule = new Cnab400CaixaGroupRule()
    const groupStarts = rawLines.map((line: string) => groupRule.check(line))

    // Then
    expect(expectedGroupStarts.some(Boolean)).toBe(true)
    expect(groupStarts).toEqual(expectedGroupStarts)
  })
})
