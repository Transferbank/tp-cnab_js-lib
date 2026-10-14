import { describe, it, expect } from '@jest/globals'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { replaceLineRange } from '@test/test-utils'
import { DataDeOcorrenciaBoletoField } from '@cnab/field/cnab240/retorno/data-de-ocorrencia-boleto-field'
import { DataDeCreditoBoletoField } from '@cnab/field/cnab240/retorno/data-de-credito-boleto-field'

function retornoLine(segment: string): string {
  return '7560001300001'.concat(segment).padEnd(240, ' ')
}

describe.each([
  ['DataDeOcorrenciaBoletoField', DataDeOcorrenciaBoletoField, [138, 145]],
  ['DataDeCreditoBoletoField', DataDeCreditoBoletoField, [146, 153]]
])('%s', (_: string, FieldClass: CnabFieldClass<Date>, range: number[]): void => {
  const fieldRange = range as [number, number]

  it('given a filled date when reading then returns it', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('U'), fieldRange, '03062026'), 1)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual(new Date(2026, 5, 3))
  })

  it('given a zeroed date when reading then it is absent and valid', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('U'), fieldRange, '00000000'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given a segment T line when checking then does not read the field', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('T'), fieldRange, '03062026'), 1)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })
})

describe('DataBoletoField', (): void => {
  it('given an impossible date when validating then reports an invalid format', (): void => {
    // Given
    const field = new DataDeCreditoBoletoField(replaceLineRange(retornoLine('U'), [146, 153], '31022026'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo data_de_credito com formato inválido: 31022026',
          lineNumber: 1,
          fieldKey: 'data_de_credito',
          range: [146, 153]
        })
      ]
    })
  })
})
