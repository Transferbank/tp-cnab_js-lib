import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, resPath } from '@test/test-utils'
import { Cnab240BoletoGroupRule } from '@cnab/group-rule/cnab240/boleto-group-rule'

describe('Cnab240BoletoGroupRule', (): void => {
  it.each([
    ['banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt'],
    ['bradesco/cnab240/bradesco_cnab_240.txt'],
    ['caixa/cnab240/caixa_cnab_240.txt'],
    ['itau/cnab240/itau_cnab_240.txt'],
    ['santander/cnab240/santander_cnab_240.txt'],
    ['sicoob/cnab240/sicoob_cnab_240.txt'],
    ['sicredi/cnab240/sicredi_cnab_240.txt']
  ])(
    'given doc lines from %s when checking group start then marks only segment P lines',
    (examplePath: string): void => {
      // Given
      const isSegmentoP = (line: string): boolean =>
        line.length > 13 && line[7] === '3' && line[13] === 'P'
      const rawLines = readExampleLines(path.join(resPath(), examplePath))
      const expectedGroupStarts = rawLines.map(isSegmentoP)

      // When
      const groupRule = new Cnab240BoletoGroupRule()
      const groupStarts = rawLines.map((line: string) => groupRule.check(line))

      // Then
      expect(expectedGroupStarts.some(Boolean)).toBe(true)
      expect(groupStarts).toEqual(expectedGroupStarts)
    }
  )
})
