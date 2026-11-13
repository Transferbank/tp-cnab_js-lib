import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab240SegmentLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { CodigoDeMultaBoletoField } from '@cnab/field/cnab240/codigo-de-multa-boleto-field'

class BradescoCodigoDeMultaBoletoField extends CodigoDeMultaBoletoField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB240
}

describe('CodigoDeMultaBoletoField', (): void => {
  const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')), 'R')
  assert(line != null, 'Linha não encontrada')

  it('given the segment R from the example file when reading then returns the code', (): void => {
    // Given
    const field = new CodigoDeMultaBoletoField(line, 5)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe('2')
  })

  it('given a code outside the bank table when validating then reports the invalid code', (): void => {
    // Given
    const field = new BradescoCodigoDeMultaBoletoField(replaceLineRange(line, [66, 66], '3'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo código de multa inválido: código 3 não existe na tabela do banco',
          lineNumber: 5,
          fieldKey: 'codigo_de_multa',
          range: [66, 66]
        })
      ]
    })
  })
})
