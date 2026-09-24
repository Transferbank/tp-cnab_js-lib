import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, resPath } from '@test/test-utils'
import { Cnab240SicoobGroupRule } from '@cnab/bank/sicoob/cnab/cnab240/cnab-240-sicoob-group-rule'

describe('Cnab240SicoobGroupRule', (): void => {
  it('given doc lines when checking group start then marks only segment P lines', (): void => {
    // Given
    const examplePath = path.join(resPath(), 'sicoob/cnab240/sicoob_cnab_240.txt')
    const isSegmentoP = (line: string): boolean =>
      line.length > 13 && line[7] === '3' && line[13] === 'P'
    const rawLines = readExampleLines(examplePath)
    const expectedGroupStarts = rawLines.map(isSegmentoP)

    // When
    const groupRule = new Cnab240SicoobGroupRule()
    const groupStarts = rawLines.map((line: string) => groupRule.check(line))

    // Then
    expect(expectedGroupStarts.some(Boolean)).toBe(true)
    expect(groupStarts).toEqual(expectedGroupStarts)
  })
})
