import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { CodigoDeMultaBoletoField } from '@cnab/bank/santander/cnab/cnab400/field/codigo-de-multa-boleto-field'

describe('CodigoDeMultaBoletoField', (): void => {
  it('given a code outside the bank table when validating then reports the invalid code', (): void => {
    // Given
    const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'santander/cnab400/santander_cnab_400.REM')), '1')
    assert(line != null, 'Linha não encontrada')
    const field = new CodigoDeMultaBoletoField(replaceLineRange(line, [78, 78], '2'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo código de multa inválido: código 2 não existe na tabela do banco',
          lineNumber: 5,
          fieldKey: 'codigo_de_multa',
          range: [78, 78]
        })
      ]
    })
  })
})
