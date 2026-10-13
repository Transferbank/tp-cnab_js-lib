import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { optional } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400CaixaBoletoCelularField } from '@cnab/bank/caixa/cnab/cnab400/field/fields'

describe('Cnab400CaixaBoletoCelularField (record 3)', (): void => {
  const lines = readExampleLines(path.join(resPath(), 'caixa/cnab400/caixa_cnab_400.REM'))
  const registro3 = findFirstCnab400RecordLine(lines, '3')
  assert(registro3 != null, 'Registro 3 não encontrado')
  const range: [number, number] = [106, 114]

  it('given record 3 from the example file when reading then returns the celular', (): void => {
    // Given
    const field = new Cnab400CaixaBoletoCelularField(registro3, 5)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe('998877665')
  })

  it('given record 3 with the celular filled with zeros when validating the optional field then accepts it as blank', (): void => {
    // Given
    const lineWithZeros = replaceLineRange(registro3, range, '0'.repeat(range[1] - range[0] + 1))
    const field = new (optional(Cnab400CaixaBoletoCelularField))(lineWithZeros, 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given record 3 with non numeric celular when validating then reports format error', (): void => {
    // Given
    const field = new Cnab400CaixaBoletoCelularField(replaceLineRange(registro3, range, '98765A321'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo celular do sacado inválido: deve conter 8 ou 9 dígitos numéricos',
          lineNumber: 5,
          fieldKey: 'celular_do_sacado',
          range
        })
      ]
    })
  })
})
