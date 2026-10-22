import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, findFirstCnab400RecordLine, getFieldRange, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { Cnab400BoletoSeuNumeroField } from '@cnab/field/cnab400/boleto-seu-numero-field'

const cases: FieldTestCase[] = [
  [
    'Cnab400BoletoSeuNumeroField (exemplo Itaú)',
    Cnab400BoletoSeuNumeroField,
    'itau/cnab400/ITAU_cnab_400.REM',
    '1',
    'NF76872-04'
  ]
]

describe.each<FieldTestCase>(cases)('%s', (
  _: string,
  FieldClass: CnabFieldClass<string>,
  examplePath: string,
  recordType: string,
  expectedValue: string
): void => {
  const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), examplePath)), recordType)
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

describe('Cnab400BoletoSeuNumeroField', (): void => {
  it('given a seu número filled with zeros when reading then returns null and is valid', (): void => {
    // Given
    const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'itau/cnab400/ITAU_cnab_400.REM')), '1')
    assert(line != null, 'Linha não encontrada')
    const field = new Cnab400BoletoSeuNumeroField(replaceLineRange(line, getFieldRange(Cnab400BoletoSeuNumeroField), '0000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })
})
