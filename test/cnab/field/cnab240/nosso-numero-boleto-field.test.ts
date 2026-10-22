import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, findFirstCnab240SegmentLine, getFieldRange, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { NossoNumeroBoletoField } from '@cnab/field/cnab240/nosso-numero-boleto-field'
import { NossoNumeroBoletoField as CaixaNossoNumeroBoletoField } from '@cnab/bank/caixa/cnab/cnab240/field/nosso-numero-boleto-field'
import { NossoNumeroBoletoField as ItauNossoNumeroBoletoField } from '@cnab/bank/itau/cnab/cnab240/field/nosso-numero-boleto-field'
import { Cnab240SantanderBoletoNossoNumeroField } from '@cnab/bank/santander/cnab/cnab240/field/fields'
import { Cnab240SicrediBoletoNossoNumeroField } from '@cnab/bank/sicredi/cnab/cnab240/field/fields'

const cases: FieldTestCase[] = [
  [
    'Bradesco CNAB240 (classe base)',
    NossoNumeroBoletoField,
    'bradesco/cnab240/bradesco_cnab_240.txt',
    'P',
    '00100000000123450010'
  ],
  [
    'Caixa CNAB240',
    CaixaNossoNumeroBoletoField,
    'caixa/cnab240/caixa_cnab_240.txt',
    'P',
    '14000000000000001'
  ],
  [
    'Itaú CNAB240',
    ItauNossoNumeroBoletoField,
    'itau/cnab240/itau_cnab_240.txt',
    'P',
    '109000000010'
  ],
  [
    'Santander CNAB240',
    Cnab240SantanderBoletoNossoNumeroField,
    'santander/cnab240/santander_cnab_240.txt',
    'P',
    '0000000000019'
  ],
  [
    'Sicredi CNAB240',
    Cnab240SicrediBoletoNossoNumeroField,
    'sicredi/cnab240/sicredi_cnab_240.txt',
    'P',
    '262000010'
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

describe('NossoNumeroBoletoField', (): void => {
  it('given a nosso número filled with zeros when reading then returns null and is valid', (): void => {
    // Given
    const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')), 'P')
    assert(line != null, 'Linha não encontrada')
    const field = new NossoNumeroBoletoField(replaceLineRange(line, getFieldRange(NossoNumeroBoletoField), '00000000000000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })
})
