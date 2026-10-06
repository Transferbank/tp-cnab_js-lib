import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab240SegmentLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { optional } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240CaixaBoletoCelularField, Cnab240CaixaBoletoDddField } from '@cnab/bank/caixa/cnab/cnab240/field/fields'

const segmentoY04 = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'caixa/cnab240/caixa_cnab_240.txt')), 'Y')
assert(segmentoY04 != null, 'Linha com segmento Y não encontrada')
const withPhone = (ddd: string, celular: string): string =>
  replaceLineRange(replaceLineRange(segmentoY04, [70, 71], ddd), [72, 80], celular)

describe.each([
  ['Cnab240CaixaBoletoDddField', optional(Cnab240CaixaBoletoDddField), [70, 71], '21', 'Campo ddd do sacado inválido: deve conter 2 dígitos numéricos'],
  ['Cnab240CaixaBoletoCelularField', optional(Cnab240CaixaBoletoCelularField), [72, 80], '912345678', 'Campo celular do sacado inválido: deve conter 8 ou 9 dígitos numéricos']
])('%s', (_: string, FieldClass: ReturnType<typeof optional>, range: number[], expectedValue: string, invalidMessage: string): void => {
  it('given segment Y-04 filled with zeros when validating optional field then accepts it as blank', (): void => {
    // Given
    const field = new FieldClass(withPhone('00', '000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given segment Y-04 with non numeric content when validating then reports format error', (): void => {
    // Given
    const field = new FieldClass(withPhone('1A', '98765A321'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [new CnabGenericFieldError({ message: invalidMessage, lineNumber: 5, fieldKey: field.fieldKey, range: range as [number, number] })]
    })
  })

  it('given segment Y-04 from the example file when reading then returns it', (): void => {
    // Given
    const field = new FieldClass(segmentoY04, 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(expectedValue)
  })
})
