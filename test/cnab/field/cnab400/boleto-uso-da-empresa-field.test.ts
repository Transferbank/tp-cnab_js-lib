import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, FindLine, cnab400RecordLineFinder, readExampleLines, resPath } from '@test/test-utils'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { Cnab400BoletoUsoDaEmpresaField } from '@cnab/field/cnab400/boleto-uso-da-empresa-field'

const baseCases: FieldTestCase[] = [
  [
    'Cnab400BoletoUsoDaEmpresaField (posições gerais, exemplo Itaú)',
    Cnab400BoletoUsoDaEmpresaField,
    'itau/cnab400/ITAU_cnab_400.REM',
    cnab400RecordLineFinder('1'),
    '25.150923.04'
  ]
]

const bancoDoBrasilCases: FieldTestCase[] = []

const bradescoCases: FieldTestCase[] = []

const caixaCases: FieldTestCase[] = []

const itauCases: FieldTestCase[] = []

const santanderCases: FieldTestCase[] = []

const sicoobCases: FieldTestCase[] = []

const sicrediCases: FieldTestCase[] = []

describe.each<FieldTestCase>([
  ...baseCases,
  ...bancoDoBrasilCases,
  ...bradescoCases,
  ...caixaCases,
  ...itauCases,
  ...santanderCases,
  ...sicoobCases,
  ...sicrediCases
])('%s', (_: string, FieldClass: CnabFieldClass<string>, examplePath: string, findLine: FindLine, expectedValue: string): void => {
  const line = findLine(readExampleLines(path.join(resPath(), examplePath)))
  assert(line != null, `Linha não encontrada em ${examplePath}`)

  it('given the detail record from the example file when reading then returns the field as written', (): void => {
    // Given
    const field = new FieldClass(line, 5)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(expectedValue)
  })
})
