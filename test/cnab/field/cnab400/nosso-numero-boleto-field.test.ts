import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, findFirstCnab400RecordLine, getFieldRange, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { NossoNumeroBoletoField } from '@cnab/field/cnab400/nosso-numero-boleto-field'
import { NossoNumeroBoletoField as BancoDoBrasilNossoNumeroBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/nosso-numero-boleto-field'
import { NossoNumeroBoletoField as BradescoNossoNumeroBoletoField } from '@cnab/bank/bradesco/cnab/cnab400/field/nosso-numero-boleto-field'
import { Cnab400CaixaBoletoNossoNumeroField } from '@cnab/bank/caixa/cnab/cnab400/field/fields'
import { Cnab400SicoobBoletoNossoNumeroField } from '@cnab/bank/sicoob/cnab/cnab400/field/fields'
import { Cnab400SicrediBoletoNossoNumeroField } from '@cnab/bank/sicredi/cnab/cnab400/field/fields'

const cases: FieldTestCase[] = [
  [
    'Banco do Brasil CNAB400 (registro 7)',
    BancoDoBrasilNossoNumeroBoletoField,
    'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM',
    '7',
    '90076541000044534'
  ],
  [
    'Bradesco CNAB400',
    BradescoNossoNumeroBoletoField,
    'bradesco/cnab400/bradesco_cnab_400.txt',
    '1',
    '09100010629P'
  ],
  [
    'Caixa CNAB400',
    Cnab400CaixaBoletoNossoNumeroField,
    'caixa/cnab400/caixa_cnab_400.REM',
    '1',
    '01000000000000001'
  ],
  [
    'Itaú CNAB400 (classe base)',
    NossoNumeroBoletoField,
    'itau/cnab400/ITAU_cnab_400.REM',
    '1',
    '10377333'
  ],
  [
    'Sicoob CNAB400',
    Cnab400SicoobBoletoNossoNumeroField,
    'sicoob/cnab400/sicoob_cnab_400.REM',
    '1',
    '000000010011'
  ],
  [
    'Sicredi CNAB400',
    Cnab400SicrediBoletoNossoNumeroField,
    'sicredi/cnab400/sicredi_cnab_400.REM',
    '1',
    '262000001'
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

describe('NossoNumeroBoletoField', (): void => {
  it('given a nosso número filled with zeros when reading then returns null and is valid', (): void => {
    // Given
    const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'itau/cnab400/ITAU_cnab_400.REM')), '1')
    assert(line != null, 'Linha não encontrada')
    const field = new NossoNumeroBoletoField(replaceLineRange(line, getFieldRange(NossoNumeroBoletoField), '00000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })
})
