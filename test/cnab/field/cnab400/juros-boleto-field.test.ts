import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, getFieldRange, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { JurosBoletoField } from '@cnab/field/cnab400/juros-boleto-field'
import { JurosBoletoField as BancoDoBrasilJurosBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/juros-boleto-field'

const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'itau/cnab400/ITAU_cnab_400.REM')), '1')
assert(line != null, 'Linha não encontrada')

describe('JurosBoletoField', (): void => {
  it('given the detail record from the example file when reading then returns the juros with two decimals', (): void => {
    // Given
    const field = new JurosBoletoField(line, 5)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(6.76)
  })

  it('given juros filled with zeros when reading then returns null and is valid', (): void => {
    // Given
    const field = new JurosBoletoField(replaceLineRange(line, getFieldRange(JurosBoletoField), '0000000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given the record 7 of the Banco do Brasil example file when reading then returns the juros', (): void => {
    // Given
    const record7 = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM')), '7')
    assert(record7 != null, 'Linha não encontrada')
    const field = new BancoDoBrasilJurosBoletoField(record7, 5)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(3.39)
  })
})
