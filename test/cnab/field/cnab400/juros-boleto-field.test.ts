import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, getFieldRange, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { JurosBoletoField } from '@cnab/field/cnab400/juros-boleto-field'

describe('JurosBoletoField', (): void => {
  it('given juros filled with zeros when reading then returns null and is valid', (): void => {
    // Given
    const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'itau/cnab400/ITAU_cnab_400.REM')), '1')
    assert(line != null, 'Linha não encontrada')
    const field = new JurosBoletoField(replaceLineRange(line, getFieldRange(JurosBoletoField), '0000000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })
})
