import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { CodigoDeMultaBoletoField } from '@cnab/field/cnab400/codigo-de-multa-boleto-field'

class SantanderCodigoDeMultaBoletoField extends CodigoDeMultaBoletoField {
  static readonly bank = CnabBank.SANTANDER
  static readonly format = CnabFormat.CNAB400
}

describe('CodigoDeMultaBoletoField', (): void => {
  const line = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'santander/cnab400/santander_cnab_400.REM')), '1')
  assert(line != null, 'Linha não encontrada')

  it('given the detail record from the example file when reading then returns the code', (): void => {
    // Given
    const field = new CodigoDeMultaBoletoField(line, 5)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe('4')
  })

  it('given a code outside the bank table when validating then reports the invalid code', (): void => {
    // Given
    const field = new SantanderCodigoDeMultaBoletoField(replaceLineRange(line, [78, 78], '2'), 5)

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
