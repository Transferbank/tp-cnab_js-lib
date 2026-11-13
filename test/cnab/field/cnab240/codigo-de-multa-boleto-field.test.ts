import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab240SegmentLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { CodigoDeMultaBoletoField } from '@cnab/bank/bradesco/cnab/cnab240/field/codigo-de-multa-boleto-field'

describe('CodigoDeMultaBoletoField', (): void => {
  it('given a code outside the bank table when validating then reports the invalid code', (): void => {
    // Given
    const line = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')), 'R')
    assert(line != null, 'Linha não encontrada')
    const field = new CodigoDeMultaBoletoField(replaceLineRange(line, [66, 66], '3'), 5)

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
