import { describe, it, expect } from '@jest/globals'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { cnab400RetornoLine, replaceLineRange } from '@test/test-utils'
import { DataDeOcorrenciaBoletoField } from '@cnab/field/cnab400/retorno/data-de-ocorrencia-boleto-field'
import { DataDeCreditoBoletoField } from '@cnab/field/cnab400/retorno/data-de-credito-boleto-field'

describe.each([
  ['DataDeOcorrenciaBoletoField', DataDeOcorrenciaBoletoField, [111, 116]],
  ['DataDeCreditoBoletoField', DataDeCreditoBoletoField, [296, 301]]
])('%s', (_: string, FieldClass: CnabFieldClass<Date>, range: number[]): void => {
  it('given a filled date in a detail record when reading then returns it', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(cnab400RetornoLine('1'), range as [number, number], '030626'), 1)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toEqual(new Date(2026, 5, 3))
  })
})

describe('DataBoletoField', (): void => {
  it('given a zeroed date when reading then it is absent and valid', (): void => {
    // Given
    const field = new DataDeCreditoBoletoField(replaceLineRange(cnab400RetornoLine('1'), [296, 301], '000000'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given a header record when checking then does not read the field', (): void => {
    // Given
    const field = new DataDeCreditoBoletoField(cnab400RetornoLine('0'), 1)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })

  it('given an impossible date when validating then reports an invalid format', (): void => {
    // Given
    const field = new DataDeCreditoBoletoField(replaceLineRange(cnab400RetornoLine('1'), [296, 301], '310226'), 1)

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
