import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, resPath } from '@test/test-utils'
import { Cnab240RemessaBoletoGroupRule } from '@cnab/group-rule/cnab240/remessa-boleto-group-rule'

describe('Cnab240RemessaBoletoGroupRule', (): void => {
  it.each([
    ['banco-do-brasil/cnab240/remessa/banco_do_brasil_cnab_240.txt'],
    ['bradesco/cnab240/remessa/bradesco_cnab_240.txt'],
    ['caixa/cnab240/remessa/caixa_cnab_240.txt'],
    ['itau/cnab240/remessa/itau_cnab_240.txt'],
    ['santander/cnab240/remessa/santander_cnab_240.txt'],
    ['sicoob/cnab240/remessa/sicoob_cnab_240.txt'],
    ['sicredi/cnab240/remessa/sicredi_cnab_240.txt']
  ])(
    'given doc lines from %s when checking group start then marks only segment P lines',
    (examplePath: string): void => {
      // Given
      const isSegmentoP = (line: string): boolean =>
        line.length > 13 && line[7] === '3' && line[13] === 'P'
      const rawLines = readExampleLines(path.join(resPath(), examplePath))
      const expectedGroupStarts = rawLines.map(isSegmentoP)

      // When
      const groupRule = new Cnab240RemessaBoletoGroupRule()
      const groupStarts = rawLines.map((line: string) => groupRule.check(line))

      // Then
      expect(expectedGroupStarts.some(Boolean)).toBe(true)
      expect(groupStarts).toEqual(expectedGroupStarts)
    }
  )
})
