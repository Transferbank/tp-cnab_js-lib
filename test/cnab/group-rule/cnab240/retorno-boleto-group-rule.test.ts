import { describe, it, expect } from '@jest/globals'
import { cnab240RetornoLine } from '@test/test-utils'
import { Cnab240RetornoBoletoGroupRule } from '@cnab/group-rule/cnab240/retorno-boleto-group-rule'

describe('Cnab240RetornoBoletoGroupRule', (): void => {
  it.each([
    ['segment T', cnab240RetornoLine('3', 'T'), true],
    ['segment U', cnab240RetornoLine('3', 'U'), false],
    ['segment Y', cnab240RetornoLine('3', 'Y'), false],
    ['file header', cnab240RetornoLine('0'), false],
    ['batch header', cnab240RetornoLine('1'), false],
    ['batch trailer', cnab240RetornoLine('5'), false],
    ['file trailer', cnab240RetornoLine('9'), false]
  ])('given a %s line when checking group start then returns %s', (_: string, rawLine: string, expectedGroupStart: boolean): void => {
    // Given
    const groupRule = new Cnab240RetornoBoletoGroupRule()

    // When
    const isGroupStart = groupRule.check(rawLine)

    // Then
    expect(isGroupStart).toBe(expectedGroupStart)
  })
})
