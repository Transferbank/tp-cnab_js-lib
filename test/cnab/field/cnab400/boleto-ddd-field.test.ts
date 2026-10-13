import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { optional } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400CaixaBoletoDddField } from '@cnab/bank/caixa/cnab/cnab400/field/fields'

describe('Cnab400CaixaBoletoDddField (record 3)', (): void => {
  const lines = readExampleLines(path.join(resPath(), 'caixa/cnab400/caixa_cnab_400.REM'))
  const registro3 = findFirstCnab400RecordLine(lines, '3')
  assert(registro3 != null, 'Registro 3 não encontrado')
  const range: [number, number] = [104, 105]

  it('given record 3 from the example file when reading then returns the ddd', (): void => {
    // Given
    const field = new Cnab400CaixaBoletoDddField(registro3, 5)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe('31')
  })

  it('given record 3 with the ddd filled with zeros when validating the optional field then accepts it as blank', (): void => {
    // Given
    const lineWithZeros = replaceLineRange(registro3, range, '0'.repeat(range[1] - range[0] + 1))
    const field = new (optional(Cnab400CaixaBoletoDddField))(lineWithZeros, 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given record 3 with non numeric ddd when validating then reports format error', (): void => {
    // Given
    const field = new Cnab400CaixaBoletoDddField(replaceLineRange(registro3, range, '1A'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo ddd do sacado inválido: deve conter 2 dígitos numéricos',
          lineNumber: 5,
          fieldKey: 'ddd_do_sacado',
          range
        })
      ]
    })
  })
})
