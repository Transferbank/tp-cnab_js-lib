import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { findFirstCnab240SegmentLine, readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { optional } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240CaixaBoletoCelularField, Cnab240CaixaBoletoDddField } from '@cnab/bank/caixa/cnab/cnab240/field/fields'

const segmentoQ = findFirstCnab240SegmentLine(readExampleLines(path.join(resPath(), 'caixa/cnab240/caixa_cnab_240.txt')), 'Q')
assert(segmentoQ != null, 'Linha com segmento Q não encontrada')
const toSegmentoY04 = (ddd: string, celular: string): string =>
  replaceLineRange(replaceLineRange(replaceLineRange(replaceLineRange(segmentoQ, [14, 14], 'Y'), [18, 19], '04'), [70, 71], ddd), [72, 80], celular)

describe.each([
  ['Cnab240CaixaBoletoDddField', optional(Cnab240CaixaBoletoDddField), [70, 71], '11', 'Campo ddd do sacado inválido: deve conter 2 dígitos numéricos'],
  ['Cnab240CaixaBoletoCelularField', optional(Cnab240CaixaBoletoCelularField), [72, 80], '987654321', 'Campo celular do sacado inválido: deve conter 8 ou 9 dígitos numéricos']
])('%s', (_: string, FieldClass: ReturnType<typeof optional>, range: number[], expectedValue: string, invalidMessage: string): void => {
  it('given segment Y-04 filled with zeros when validating optional field then accepts it as blank', (): void => {
    // Given
    const field = new FieldClass(toSegmentoY04('00', '000000000'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given segment Y-04 with non numeric content when validating then reports format error', (): void => {
    // Given
    const field = new FieldClass(toSegmentoY04('1A', '98765A321'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [new CnabGenericFieldError({ message: invalidMessage, lineNumber: 5, fieldKey: field.fieldKey, range: range as [number, number] })]
    })
  })

  it('given segment Y-04 with valid content when reading then returns it', (): void => {
    // Given
    const field = new FieldClass(toSegmentoY04('11', '987654321'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(expectedValue)
  })
})
