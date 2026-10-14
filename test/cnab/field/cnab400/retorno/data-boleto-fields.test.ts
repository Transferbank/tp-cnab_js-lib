import { describe, it, expect } from '@jest/globals'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { replaceLineRange } from '@test/test-utils'
import { DataDeOcorrenciaBoletoField } from '@cnab/field/cnab400/retorno/data-de-ocorrencia-boleto-field'
import { DataDeCreditoBoletoField } from '@cnab/field/cnab400/retorno/data-de-credito-boleto-field'

function retornoLine(recordType: string): string {
  return recordType.padEnd(400, ' ')
}

describe.each([
  ['DataDeOcorrenciaBoletoField', DataDeOcorrenciaBoletoField, [111, 116]],
  ['DataDeCreditoBoletoField', DataDeCreditoBoletoField, [296, 301]]
])('%s', (_: string, FieldClass: CnabFieldClass<Date>, range: number[]): void => {
  const fieldRange = range as [number, number]

  it('given a filled date when reading then returns it', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('1'), fieldRange, '030626'), 1)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual(new Date(2026, 5, 3))
  })

  it('given a zeroed date when reading then it is absent and valid', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('1'), fieldRange, '000000'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given a header record when checking then does not read the field', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('0'), fieldRange, '030626'), 1)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })
})

describe('DataBoletoField', (): void => {
  it('given an impossible date when validating then reports an invalid format', (): void => {
    // Given
    const field = new DataDeCreditoBoletoField(replaceLineRange(retornoLine('1'), [296, 301], '310226'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo data_de_credito com formato inválido: 310226',
          lineNumber: 1,
          fieldKey: 'data_de_credito',
          range: [296, 301]
        })
      ]
    })
  })
})
