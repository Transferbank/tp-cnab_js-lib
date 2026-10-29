import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab240SegmentLine, readExampleLines, resPath } from '@test/test-utils'
import { CodigoDeJurosBoletoField } from '@cnab/field/cnab240/codigo-de-juros-boleto-field'

describe('CodigoDeJurosBoletoField', (): void => {
  it('given the segment P from the example file when reading then returns the code', (): void => {
    // Given
    const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')), 'P')
    assert(line != null, 'Linha não encontrada')
    const field = new CodigoDeJurosBoletoField(line, 5)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe('1')
  })
})
