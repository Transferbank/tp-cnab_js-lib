import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, readExampleLines, resPath } from '@test/test-utils'
import { MultaBoletoField } from '@cnab/field/cnab400/multa-boleto-field'

describe('MultaBoletoField', (): void => {
  it('given the detail record from the example file when reading then returns the multa with two decimals', (): void => {
    // Given
    const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'santander/cnab400/santander_cnab_400.REM')), '1')
    assert(line != null, 'Linha não encontrada')
    const field = new MultaBoletoField(line, 5)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(4)
  })
})
