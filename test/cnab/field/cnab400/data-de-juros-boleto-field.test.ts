import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, readExampleLines, resPath } from '@test/test-utils'
import { DataDeJurosBoletoField } from '@cnab/field/cnab400/data-de-juros-boleto-field'

describe('DataDeJurosBoletoField', (): void => {
  it('given the detail record from the example file when reading then returns the date', (): void => {
    // Given
    const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'caixa/cnab400/caixa_cnab_400.REM')), '1')
    assert(line != null, 'Linha não encontrada')
    const field = new DataDeJurosBoletoField(line, 5)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual(new Date(2026, 7, 16))
  })
})
