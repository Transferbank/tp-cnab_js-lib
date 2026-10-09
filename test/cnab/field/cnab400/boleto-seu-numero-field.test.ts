import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, findFieldClass, findFirstCnab400RecordLine, readExampleLines, resPath } from '@test/test-utils'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CNAB_SEU_NUMERO_FIELDS } from '@cnab/bank/cnab-identification-fields'
import { Cnab400BoletoSeuNumeroField } from '@cnab/field/cnab400/boleto-seu-numero-field'

const baseCases: FieldTestCase[] = [
  [
    'Cnab400BoletoSeuNumeroField (exemplo Itaú)',
    Cnab400BoletoSeuNumeroField({ bank: CnabBank.ITAU, range: [111, 120] }),
    'itau/cnab400/ITAU_cnab_400.REM',
    '1',
    'NF76872-04'
  ]
]

const bancoDoBrasilCases: FieldTestCase[] = [
  [
    'Banco do Brasil CNAB400 (record 7)',
    findFieldClass(CNAB_SEU_NUMERO_FIELDS, CnabBank.BANCODOBRASIL, CnabFormat.CNAB400),
    'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM',
    '7',
    'NF82697-02'
  ],
  [
    'Banco do Brasil CNAB400 (record 5, service type 03, 15 positions)',
    findFieldClass(CNAB_SEU_NUMERO_FIELDS, CnabBank.BANCODOBRASIL, CnabFormat.CNAB400, 1),
    'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM',
    '503',
    'PEDIDO1234-1/3'
  ]
]

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
])('%s', (
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
