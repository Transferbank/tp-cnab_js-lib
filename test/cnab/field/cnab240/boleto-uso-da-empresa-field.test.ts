import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { FieldTestCase, findFieldClass, findFirstCnab240SegmentLine, readExampleLines, resPath } from '@test/test-utils'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CNAB_USO_DA_EMPRESA_FIELDS } from '@cnab/bank/cnab-identification-fields'
import { Cnab240BoletoUsoDaEmpresaField } from '@cnab/field/cnab240/boleto-uso-da-empresa-field'

const baseCases: FieldTestCase[] = [
  [
    'Cnab240BoletoUsoDaEmpresaField (padrão FEBRABAN, exemplo Bradesco)',
    Cnab240BoletoUsoDaEmpresaField({ bank: CnabBank.BRADESCO }),
    'bradesco/cnab240/bradesco_cnab_240.txt',
    'P',
    '000000000NF0000123'
  ]
]

const bancoDoBrasilCases: FieldTestCase[] = [
  [
    'Banco do Brasil CNAB240',
    findFieldClass(CNAB_USO_DA_EMPRESA_FIELDS, CnabBank.BANCODOBRASIL, CnabFormat.CNAB240),
    'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt',
    'P',
    'PED1234-1/3'
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
