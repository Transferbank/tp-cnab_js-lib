import { describe, it, expect } from '@jest/globals'
import { Cnab240RetornoBoletoGroupRule } from '@cnab/group-rule/cnab240/retorno-boleto-group-rule'

function retornoLine(recordType: string, segment: string = ' '): string {
  return '7560001'.concat(recordType, '00001', segment).padEnd(240, ' ')
}

describe('Cnab240RetornoBoletoGroupRule', (): void => {
  it.each([
    ['segment T', retornoLine('3', 'T'), true],
    ['segment U', retornoLine('3', 'U'), false],
    ['segment Y', retornoLine('3', 'Y'), false],
    ['file header', retornoLine('0'), false],
    ['batch header', retornoLine('1'), false],
    ['batch trailer', retornoLine('5'), false],
    ['file trailer', retornoLine('9'), false]
  ])('given a %s line when checking group start then returns %s', (_: string, rawLine: string, expectedGroupStart: boolean): void => {
    // Given
    const groupRule = new Cnab240RetornoBoletoGroupRule()

    // When
    const isGroupStart = groupRule.check(rawLine)

    // Then
    expect(isGroupStart).toBe(expectedGroupStart)
  })
})
