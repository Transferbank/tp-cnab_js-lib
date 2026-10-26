import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab240SegmentLine, readExampleLines, resPath } from '@test/test-utils'
import { DataDeMultaBoletoField } from '@cnab/field/cnab240/data-de-multa-boleto-field'

describe('DataDeMultaBoletoField', (): void => {
  it('given the segment R from the example file when reading then returns the date', (): void => {
    // Given
    const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')), 'R')
    assert(line != null, 'Linha não encontrada')
    const field = new DataDeMultaBoletoField(line, 5)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual(new Date(2026, 11, 15))
  })
})
