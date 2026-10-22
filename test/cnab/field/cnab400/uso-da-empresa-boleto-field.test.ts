import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, findFirstCnab400RecordLine, getFieldRange, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { UsoDaEmpresaBoletoField } from '@cnab/field/cnab400/uso-da-empresa-boleto-field'
import { UsoDaEmpresaBoletoField as BancoDoBrasilUsoDaEmpresaBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/uso-da-empresa-boleto-field'
import { UsoDaEmpresaBoletoField as CaixaUsoDaEmpresaBoletoField } from '@cnab/bank/caixa/cnab/cnab400/field/uso-da-empresa-boleto-field'

const cases: FieldTestCase[] = [
  [
    'UsoDaEmpresaBoletoField (exemplo Itaú)',
    UsoDaEmpresaBoletoField,
    'itau/cnab400/ITAU_cnab_400.REM',
    '1',
    '000000000000000010001-1/3'
  ],
  [
    'Banco do Brasil CNAB400 (registro 7)',
    BancoDoBrasilUsoDaEmpresaBoletoField,
    'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM',
    '7',
    '10.010001.01'
  ],
  [
    'Caixa CNAB400',
    CaixaUsoDaEmpresaBoletoField,
    'caixa/cnab400/caixa_cnab_400.REM',
    '1',
    'PED0000001-1/3'
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

describe('UsoDaEmpresaBoletoField', (): void => {
  it('given a uso da empresa filled with zeros when reading then returns null and is valid', (): void => {
    // Given
    const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'itau/cnab400/ITAU_cnab_400.REM')), '1')
    assert(line != null, 'Linha não encontrada')
    const field = new UsoDaEmpresaBoletoField(replaceLineRange(line, getFieldRange(UsoDaEmpresaBoletoField), '0000000000000000000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })
})
