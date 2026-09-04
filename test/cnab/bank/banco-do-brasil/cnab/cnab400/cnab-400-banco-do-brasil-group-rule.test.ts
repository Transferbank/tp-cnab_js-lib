import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, resPath } from '@test/test-utils'
import { Cnab400BancoDoBrasilGroupRule } from '@cnab/bank/banco-do-brasil/cnab/cnab400/cnab-400-banco-do-brasil-group-rule'

describe('Cnab400BancoDoBrasilGroupRule', (): void => {
  it('given doc lines when checking group start then marks only boleto lines', (): void => {
    // Given
    const examplePath = path.join(resPath(), 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM')
    const boletoRecordType = '7'
    const rawLines = readExampleLines(examplePath)
    const expectedGroupStarts = rawLines.map((line: string) => line.startsWith(boletoRecordType))

    // When
    const groupRule = new Cnab400BancoDoBrasilGroupRule()
    const groupStarts = rawLines.map((line: string) => groupRule.check(line))

    // Then
    expect(expectedGroupStarts.some(Boolean)).toBe(true)
    expect(groupStarts).toEqual(expectedGroupStarts)
  })
})
