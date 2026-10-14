import { describe, it, expect } from '@jest/globals'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { replaceLineRange } from '@test/test-utils'
import { UsoDaEmpresaBoletoField } from '@cnab/field/cnab400/retorno/uso-da-empresa-boleto-field'
import { NossoNumeroBoletoField } from '@cnab/field/cnab400/retorno/nosso-numero-boleto-field'
import { SeuNumeroBoletoField } from '@cnab/field/cnab400/retorno/seu-numero-boleto-field'

function retornoLine(recordType: string): string {
  return recordType.padEnd(400, ' ')
}

describe.each([
  ['UsoDaEmpresaBoletoField', UsoDaEmpresaBoletoField, [38, 62], 'PED1234-1/3'],
  ['NossoNumeroBoletoField', NossoNumeroBoletoField, [63, 70], '10377333'],
  ['SeuNumeroBoletoField', SeuNumeroBoletoField, [117, 126], 'NF82697-02']
])('%s', (_: string, FieldClass: CnabFieldClass<string>, range: number[], value: string): void => {
  const fieldRange = range as [number, number]

  it('given a detail record when reading then returns the field as written', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('1'), fieldRange, value), 1)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(value)
  })

  it('given a header record when checking then does not read the field', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('0'), fieldRange, value), 1)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })
})
