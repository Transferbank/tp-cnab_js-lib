import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, FindLine, cnab240SegmentLineFinder, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import { Cnab240BoletoUsoDaEmpresaField } from '@cnab/field/cnab240/boleto-uso-da-empresa-field'

const baseCases: FieldTestCase[] = [
  [
    'Cnab240BoletoUsoDaEmpresaField (padrão FEBRABAN, exemplo Bradesco)',
    Cnab240BoletoUsoDaEmpresaField,
    'bradesco/cnab240/bradesco_cnab_240.txt',
    cnab240SegmentLineFinder('P'),
    [196, 220],
    '000000000NF0000123'
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
])('%s', (_: string, FieldClass: CnabFieldClass<string>, examplePath: string, findLine: FindLine, range: [number, number], expectedValue: string): void => {
  const line = findLine(readExampleLines(path.join(resPath(), examplePath)))
  assert(line != null, `Linha não encontrada em ${examplePath}`)

  it('given the segment P from the example file when reading then returns the field as written', (): void => {
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

  it('given the field blank when validating the optional field then accepts it without a value', (): void => {
    // Given
    const field = new (optional(FieldClass))(replaceLineRange(line, range, ''), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })
})
