import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab240SegmentLine, readExampleLines, resPath } from '@test/test-utils'
import { MultaBoletoField } from '@cnab/field/cnab240/multa-boleto-field'

describe('MultaBoletoField', (): void => {
  it('given the segment R from the example file when reading then returns the multa with two decimals', (): void => {
    // Given
    const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')), 'R')
    assert(line != null, 'Linha não encontrada')
    const field = new MultaBoletoField(line, 5)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(2)
  })

  it('given the segment R without multa from the example file when reading then returns null and is valid', (): void => {
    // Given
    const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'sicoob/cnab240/sicoob_cnab_240.txt')), 'R')
    assert(line != null, 'Linha não encontrada')
    const field = new MultaBoletoField(line, 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })
})
