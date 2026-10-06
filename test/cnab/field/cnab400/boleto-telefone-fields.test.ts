import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab400RecordLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { optional } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab400BoletoDddField } from '@cnab/field/cnab400/boleto-ddd-field'
import { Cnab400BoletoCelularField } from '@cnab/field/cnab400/boleto-celular-field'

const detalheCaixa = findFirstCnab400RecordLine(readExampleLines(path.join(resPath(), 'caixa/cnab400/caixa_cnab_400.REM')), '1')
assert(detalheCaixa != null, 'Registro 1 não encontrado')
const toRegistro3 = (ddd: string, celular: string): string =>
  replaceLineRange(replaceLineRange(replaceLineRange(detalheCaixa, [1, 1], '3'), [104, 105], ddd), [106, 114], celular)

describe.each([
  ['Cnab400BoletoDddField', optional(Cnab400BoletoDddField), [104, 105], '11', 'Campo ddd do sacado inválido: deve conter 2 dígitos numéricos'],
  ['Cnab400BoletoCelularField', optional(Cnab400BoletoCelularField), [106, 114], '987654321', 'Campo celular do sacado inválido: deve conter 8 ou 9 dígitos numéricos']
])('%s', (_: string, FieldClass: ReturnType<typeof optional>, range: number[], expectedValue: string, invalidMessage: string): void => {
  it('given record 3 filled with zeros when validating optional field then accepts it as blank', (): void => {
    // Given
    const field = new FieldClass(toRegistro3('00', '000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given record 3 with non numeric content when validating then reports format error', (): void => {
    // Given
    const field = new FieldClass(toRegistro3('1A', '98765A321'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [new CnabGenericFieldError({ message: invalidMessage, lineNumber: 5, fieldKey: field.fieldKey, range: range as [number, number] })]
    })
  })

  it('given record 3 with valid content when reading then returns it', (): void => {
    // Given
    const field = new FieldClass(toRegistro3('11', '987654321'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(expectedValue)
  })
})
