import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import assert from 'node:assert'
import { findFirstCnab240SegmentLine, findFirstCnab400RecordLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { Cnab240LineTypeChecker, Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'

describe('Cnab240LineTypeChecker', (): void => {
  const rawLines = readExampleLines(path.join(resPath(), 'caixa/cnab240/caixa_cnab_240.txt'))
  const segmentoQ = findFirstCnab240SegmentLine(rawLines, 'Q')
  assert(segmentoQ != null, 'Linha com segmento Q não encontrada')
  const toSegment = (segment: string, code: string): string =>
    replaceLineRange(replaceLineRange(segmentoQ, [14, 14], segment), [18, 19], code)

  it.each([
    ['Y-04 with code 04', toSegment('Y', '04'), '04', true],
    ['Y-04 with code 03', toSegment('Y', '03'), '04', false],
    ['segment Q', segmentoQ, '04', false]
  ])('given %s when checking segment Y with code %s then returns %s', (_: string, line: string, code: string, expected: boolean): void => {
    // When
    const result = Cnab240LineTypeChecker.isSegmentoY(line, code)

    // Then
    expect(result).toBe(expected)
  })

  it.each([
    ['print type 8', toSegment('S', '8'), true],
    ['print type 1', toSegment('S', '1'), false]
  ])('given segment S with %s when checking segment S for e-mail then returns %s', (_: string, line: string, expected: boolean): void => {
    // When
    const result = Cnab240LineTypeChecker.isSegmentoS(line, '8')

    // Then
    expect(result).toBe(expected)
  })
})

describe('Cnab400LineTypeChecker', (): void => {
  const rawLines = readExampleLines(path.join(resPath(), 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM'))
  const registro5Multa = findFirstCnab400RecordLine(rawLines, '5')
  assert(registro5Multa != null, 'Registro 5 não encontrado')

  it.each([
    ['service type 01', replaceLineRange(registro5Multa, [2, 3], '01'), true],
    ['service type 99', registro5Multa, false]
  ])('given record 5 with %s when checking record 5 with service type 01 then returns %s', (_: string, line: string, expected: boolean): void => {
    // When
    const result = Cnab400LineTypeChecker.isRegistro(line, '5', '01')

    // Then
    expect(result).toBe(expected)
  })
})
