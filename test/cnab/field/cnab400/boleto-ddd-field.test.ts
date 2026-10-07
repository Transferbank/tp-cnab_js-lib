import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { optional } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400BoletoDddField } from '@cnab/field/cnab400/boleto-ddd-field'

describe('Cnab400BoletoDddField (Caixa, record 3)', (): void => {
  const registro3 = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'caixa/cnab400/caixa_cnab_400.REM')), '3')
  assert(registro3 != null, 'Registro 3 não encontrado')
  const range: [number, number] = [104, 105]

  it('given record 3 from the example file when reading then returns the ddd', (): void => {
    // Given
    const field = new Cnab400BoletoDddField(registro3, 5)

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
    const field = new (optional(Cnab400BoletoDddField))(replaceLineRange(registro3, range, '0'.repeat(range[1] - range[0] + 1)), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given record 3 with non numeric ddd when validating then reports format error', (): void => {
    // Given
    const field = new Cnab400BoletoDddField(replaceLineRange(registro3, range, '1A'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [new CnabGenericFieldError({ message: 'Campo ddd do sacado inválido: deve conter 2 dígitos numéricos', lineNumber: 5, fieldKey: 'ddd_do_sacado', range })]
    })
  })
})
