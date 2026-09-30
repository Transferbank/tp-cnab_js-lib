import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import assert from 'node:assert'
import { findFirstCnab400RecordLine, readExampleLines, resPath } from '@test/test-utils'
import { Cnab400BoletoGroupRule } from '@cnab/group-rule/cnab400/boleto-group-rule'
import { CnabNumberedLine } from '@cnab/type/cnab-numbered-line'

describe('Cnab400BoletoGroupRule', (): void => {
  it.each([
    ['bradesco/cnab400/bradesco_cnab_400.txt'],
    ['caixa/cnab400/caixa_cnab_400.REM'],
    ['itau/cnab400/ITAU_cnab_400.REM'],
    ['santander/cnab400/santander_cnab_400.REM'],
    ['sicoob/cnab400/sicoob_cnab_400.REM'],
    ['sicredi/cnab400/sicredi_cnab_400.REM']
  ])(
    'given doc lines from %s when checking group start then marks only detail lines',
    (examplePath: string): void => {
      // Given
      const rawLines = readExampleLines(path.join(resPath(), examplePath))
      const expectedGroupStarts = rawLines.map((line: string) => line.startsWith('1'))

      // When
      const groupRule = new Cnab400BoletoGroupRule()
      const groupStarts = rawLines.map((line: string) => groupRule.check(line))

      // Then
      expect(expectedGroupStarts.some(Boolean)).toBe(true)
      expect(groupStarts).toEqual(expectedGroupStarts)
    }
  )

  it('given doc lines with custom record type when checking group start then marks only lines of that record type', (): void => {
    // Given
    const examplePath = path.join(resPath(), 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM')
    const boletoRecordType = '7'
    const rawLines = readExampleLines(examplePath)
    const expectedGroupStarts = rawLines.map((line: string) => line.startsWith(boletoRecordType))

    // When
    const groupRule = new Cnab400BoletoGroupRule(boletoRecordType)
    const groupStarts = rawLines.map((line: string) => groupRule.check(line))

    // Then
    expect(expectedGroupStarts.some(Boolean)).toBe(true)
    expect(groupStarts).toEqual(expectedGroupStarts)
  })

  it('given single line boleto group when validating then accepts it', (): void => {
    // Given
    const rawLines = readExampleLines(path.join(resPath(), 'bradesco/cnab400/bradesco_cnab_400.txt'))
    const detalhe = findFirstCnab400RecordLine(rawLines, '1')
    assert(detalhe != null, 'Linha de detalhe não encontrada')
    const group: CnabNumberedLine[] = [[1, detalhe]]

    // When
    const result = new Cnab400BoletoGroupRule().validate(group)

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
  })

  it('given boleto group with records not covered by any rule when validating then accepts it', (): void => {
    // Given
    const rawLines = readExampleLines(path.join(resPath(), 'bradesco/cnab400/bradesco_cnab_400.txt'))
    const detalhe = findFirstCnab400RecordLine(rawLines, '1')
    const mensagem = findFirstCnab400RecordLine(rawLines, '2')
    assert(detalhe != null && mensagem != null, 'Linhas de exemplo não encontradas')
    const group: CnabNumberedLine[] = [[1, detalhe], [2, mensagem], [3, mensagem]]

    // When
    const result = new Cnab400BoletoGroupRule().validate(group)

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
  })
})
