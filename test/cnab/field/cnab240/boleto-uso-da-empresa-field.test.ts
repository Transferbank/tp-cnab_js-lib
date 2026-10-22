import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, findFirstCnab240SegmentLine, getFieldRange, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { Cnab240BoletoUsoDaEmpresaField } from '@cnab/field/cnab240/boleto-uso-da-empresa-field'

const cases: FieldTestCase[] = [
  [
    'Cnab240BoletoUsoDaEmpresaField (padrão FEBRABAN, exemplo Bradesco)',
    Cnab240BoletoUsoDaEmpresaField,
    'bradesco/cnab240/bradesco_cnab_240.txt',
    'P',
    '000000000NF0000123'
  ]
]

describe.each<FieldTestCase>(cases)('%s', (
  _: string,
  FieldClass: CnabFieldClass<string>,
  examplePath: string,
  segment: string,
  expectedValue: string
): void => {
  const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), examplePath)), segment)
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
})

describe('Cnab240BoletoUsoDaEmpresaField', (): void => {
  it('given a uso da empresa filled with zeros when reading then returns null and is valid', (): void => {
    // Given
    const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')), 'P')
    assert(line != null, 'Linha não encontrada')
    const field = new Cnab240BoletoUsoDaEmpresaField(replaceLineRange(line, getFieldRange(Cnab240BoletoUsoDaEmpresaField), '0000000000000000000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })
})
