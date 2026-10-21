import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, findFirstCnab240SegmentLine, readExampleLines, resPath } from '@test/test-utils'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { Cnab240BoletoSeuNumeroField } from '@cnab/field/cnab240/boleto-seu-numero-field'

const cases: FieldTestCase[] = [
  [
    'Cnab240BoletoSeuNumeroField (padrão FEBRABAN, exemplo Bradesco)',
    Cnab240BoletoSeuNumeroField,
    'bradesco/cnab240/bradesco_cnab_240.txt',
    'P',
    'NF0000123'
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
