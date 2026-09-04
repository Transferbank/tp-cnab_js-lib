import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, resPath } from '@test/test-utils'
import { Cnab240BancoDoBrasilGroupRule } from '@cnab/bank/banco-do-brasil/cnab/cnab240/cnab-240-banco-do-brasil-group-rule'

describe('Cnab240BancoDoBrasilGroupRule', (): void => {
  it('given doc lines when checking group start then marks only segment P lines', (): void => {
    // Given
    const examplePath = path.join(resPath(), 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt')
    const isSegmentoP = (line: string): boolean =>
      line.length > 13 && line[7] === '3' && line[13] === 'P'
    const rawLines = readExampleLines(examplePath)
    const expectedGroupStarts = rawLines.map(isSegmentoP)

    // When
    const groupRule = new Cnab240BancoDoBrasilGroupRule()
    const groupStarts = rawLines.map((line: string) => groupRule.check(line))

    // Then
    expect(expectedGroupStarts.some(Boolean)).toBe(true)
    expect(groupStarts).toEqual(expectedGroupStarts)
  })
})
