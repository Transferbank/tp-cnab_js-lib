import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, findFirstCnab240SegmentLine, getFieldRange, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { SeuNumeroBoletoField } from '@cnab/field/cnab240/seu-numero-boleto-field'
import { SeuNumeroBoletoField as BancoDoBrasilSeuNumeroBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/seu-numero-boleto-field'

const cases: FieldTestCase[] = [
  [
    'SeuNumeroBoletoField (padrão FEBRABAN, exemplo Bradesco)',
    SeuNumeroBoletoField,
    'bradesco/cnab240/bradesco_cnab_240.txt',
    'P',
    'XX10001-01'
  ],
  [
    'Banco do Brasil CNAB240',
    BancoDoBrasilSeuNumeroBoletoField,
    'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt',
    'P',
    'NF00012345'
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

describe('SeuNumeroBoletoField', (): void => {
  it('given a seu número filled with zeros when reading then returns null and is valid', (): void => {
    // Given
    const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')), 'P')
    assert(line != null, 'Linha não encontrada')
    const field = new SeuNumeroBoletoField(replaceLineRange(line, getFieldRange(SeuNumeroBoletoField), '000000000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })
})
