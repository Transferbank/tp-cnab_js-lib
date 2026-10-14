import { describe, it, expect } from '@jest/globals'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { replaceLineRange } from '@test/test-utils'
import { NossoNumeroBoletoField } from '@cnab/field/cnab240/retorno/nosso-numero-boleto-field'
import { SeuNumeroBoletoField } from '@cnab/field/cnab240/retorno/seu-numero-boleto-field'
import { UsoDaEmpresaBoletoField } from '@cnab/field/cnab240/retorno/uso-da-empresa-boleto-field'

function retornoLine(segment: string): string {
  return '7560001300001'.concat(segment).padEnd(240, ' ')
}

describe.each([
  ['NossoNumeroBoletoField', NossoNumeroBoletoField, [38, 57], '00035000000001234501'],
  ['SeuNumeroBoletoField', SeuNumeroBoletoField, [59, 73], 'NF00012345'],
  ['UsoDaEmpresaBoletoField', UsoDaEmpresaBoletoField, [106, 130], 'PED1234-1/3']
])('%s', (_: string, FieldClass: CnabFieldClass<string>, range: number[], value: string): void => {
  const fieldRange = range as [number, number]

  it('given a segment T line when reading then returns the field as written', (): void => {
    // Given
    const rawLine = replaceLineRange(retornoLine('T'), fieldRange, value)
    const field = new FieldClass(rawLine, 1)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(value)
  })

  it('given a segment U line when checking then does not read the field', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('U'), fieldRange, value), 1)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })
})
