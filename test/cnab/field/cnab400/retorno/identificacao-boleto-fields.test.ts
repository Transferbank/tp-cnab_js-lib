import { describe, it, expect } from '@jest/globals'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { cnab400RetornoLine, replaceLineRange } from '@test/test-utils'
import { UsoDaEmpresaBoletoField } from '@cnab/field/cnab400/retorno/uso-da-empresa-boleto-field'
import { NossoNumeroBoletoField } from '@cnab/field/cnab400/retorno/nosso-numero-boleto-field'
import { SeuNumeroBoletoField } from '@cnab/field/cnab400/retorno/seu-numero-boleto-field'

const cases: Array<[string, CnabFieldClass<string>, [number, number], string]> = [
  ['UsoDaEmpresaBoletoField', UsoDaEmpresaBoletoField, [38, 62], 'PED1234-1/3'],
  ['NossoNumeroBoletoField', NossoNumeroBoletoField, [63, 70], '10377333'],
  ['SeuNumeroBoletoField', SeuNumeroBoletoField, [117, 126], 'NF82697-02']
]

describe.each(cases)('%s', (_: string, FieldClass: CnabFieldClass<string>, range: [number, number], value: string): void => {
  it('given a detail record when reading then returns the field as written', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(cnab400RetornoLine('1'), range, value), 1)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(value)
  })

  it('given a text when formatting and reading it back then returns the same text', (): void => {
    // Given
    const line = cnab400RetornoLine('1')
    const formatted = new FieldClass(line, 1).formatValue(value)

    // When
    const field = new FieldClass(replaceLineRange(line, range, formatted), 1)

    // Then
    expect(formatted).toHaveLength(range[1] - range[0] + 1)
    expect(field.value).toBe(value)
  })
})

describe('IdentificacaoBoletoField', (): void => {
  it('given a header record when checking then does not read the field', (): void => {
    // Given
    const field = new NossoNumeroBoletoField(cnab400RetornoLine('0'), 1)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })
})
