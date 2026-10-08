import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabFieldClass, optional } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240BradescoBoletoDddField } from '@cnab/bank/bradesco/cnab/cnab240/field/fields'
import { Cnab240CaixaBoletoDddField } from '@cnab/bank/caixa/cnab/cnab240/field/fields'
import { Cnab240BancoDoBrasilBoletoDddField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/fields'

const findSegmentoY = (examplePath: string): string => {
  const line = readExampleLines(path.join(resPath(), examplePath)).find((rawLine: string) => rawLine[13] == 'Y')
  assert(line != null, `Linha com segmento Y não encontrada em ${examplePath}`)
  return line
}

describe.each([
  ['Cnab240BradescoBoletoDddField (segment Y-04 code 03)', Cnab240BradescoBoletoDddField, 'bradesco/cnab240/bradesco_cnab_240.txt', [70, 71], '11'],
  ['Cnab240CaixaBoletoDddField (segment Y-04 code 04)', Cnab240CaixaBoletoDddField, 'caixa/cnab240/caixa_cnab_240.txt', [70, 71], '21'],
  ['Cnab240BancoDoBrasilBoletoDddField (segment Y-04 with record type 4)', Cnab240BancoDoBrasilBoletoDddField, 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', [70, 71], '11']
])('%s', (_: string, FieldClass: CnabFieldClass<string>, examplePath: string, range: number[], expectedValue: string): void => {
  const segmentoY = findSegmentoY(examplePath)
  const fieldRange = range as [number, number]

  it('given segment Y-04 from the example file when reading then returns the ddd', (): void => {
    // Given
    const field = new FieldClass(segmentoY, 5)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(expectedValue)
  })

  it('given segment Y-04 with the ddd filled with zeros when validating the optional field then accepts it as blank', (): void => {
    // Given
    const field = new (optional(FieldClass))(replaceLineRange(segmentoY, fieldRange, '0'.repeat(fieldRange[1] - fieldRange[0] + 1)), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given segment Y-04 with non numeric ddd when validating then reports format error', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(segmentoY, fieldRange, '1A'), 5)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [new CnabGenericFieldError({ message: 'Campo ddd do sacado inválido: deve conter 2 dígitos numéricos', lineNumber: 5, fieldKey: 'ddd_do_sacado', range: fieldRange })]
    })
  })
})
