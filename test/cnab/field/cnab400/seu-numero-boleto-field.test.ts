import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, findFirstCnab400RecordLine, getFieldRange, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { SeuNumeroBoletoField } from '@cnab/field/cnab400/seu-numero-boleto-field'
import { SeuNumeroBoletoField as BancoDoBrasilSeuNumeroBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/seu-numero-boleto-field'
import { SeuNumeroRegistro5BoletoField as BancoDoBrasilSeuNumeroRegistro5BoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/seu-numero-registro-5-boleto-field'
import { SeuNumeroBoletoField as CaixaSeuNumeroBoletoField } from '@cnab/bank/caixa/cnab/cnab400/field/seu-numero-boleto-field'

const cases: FieldTestCase[] = [
  [
    'SeuNumeroBoletoField (exemplo Itaú)',
    SeuNumeroBoletoField,
    'itau/cnab400/ITAU_cnab_400.REM',
    '1',
    '10001-1/3'
  ],
  [
    'Banco do Brasil CNAB400 (registro 7)',
    BancoDoBrasilSeuNumeroBoletoField,
    'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM',
    '7',
    'XX10001-01'
  ],
  [
    'Banco do Brasil CNAB400 (registro 5, 15 posições)',
    BancoDoBrasilSeuNumeroRegistro5BoletoField,
    'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM',
    '503',
    'XX100037-02'
  ],
  [
    'Caixa CNAB400',
    CaixaSeuNumeroBoletoField,
    'caixa/cnab400/caixa_cnab_400.REM',
    '1',
    '0000150826'
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

describe('SeuNumeroBoletoField', (): void => {
  it('given a seu número filled with zeros when reading then returns null and is valid', (): void => {
    // Given
    const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'itau/cnab400/ITAU_cnab_400.REM')), '1')
    assert(line != null, 'Linha não encontrada')
    const field = new SeuNumeroBoletoField(replaceLineRange(line, getFieldRange(SeuNumeroBoletoField), '0000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })
})
