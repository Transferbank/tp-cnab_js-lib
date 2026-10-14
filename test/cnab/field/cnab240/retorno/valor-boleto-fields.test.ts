import { describe, it, expect } from '@jest/globals'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { cnab240RetornoLine, replaceLineRange } from '@test/test-utils'
import { ValorTituloBoletoField } from '@cnab/field/cnab240/retorno/valor-titulo-boleto-field'
import { ValorPagoBoletoField } from '@cnab/field/cnab240/retorno/valor-pago-boleto-field'
import { JurosMultaBoletoField } from '@cnab/field/cnab240/retorno/juros-multa-boleto-field'

describe.each([
  ['ValorTituloBoletoField', ValorTituloBoletoField, 'T', 'U', [82, 96]],
  ['ValorPagoBoletoField', ValorPagoBoletoField, 'U', 'T', [78, 92]],
  ['JurosMultaBoletoField', JurosMultaBoletoField, 'U', 'T', [18, 32]]
])('%s', (_: string, FieldClass: CnabFieldClass<number>, segment: string, otherSegment: string, range: number[]): void => {
  const fieldRange = range as [number, number]

  it('given a filled amount when reading then returns it in reais', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(cnab240RetornoLine('3', segment), fieldRange, '000000000123456'), 1)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(1234.56)
  })

  it('given a zeroed amount when reading then it is absent and valid', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(cnab240RetornoLine('3', segment), fieldRange, '000000000000000'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given a line of the other segment when checking then does not read the field', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(cnab240RetornoLine('3', otherSegment), fieldRange, '000000000123456'), 1)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })
})

describe('ValorBoletoField', (): void => {
  it('given a non numeric amount when validating then reports an invalid format', (): void => {
    // Given
    const field = new ValorPagoBoletoField(replaceLineRange(cnab240RetornoLine('3', 'U'), [78, 92], '0000000001234AB'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo valor_pago com formato inválido: 0000000001234AB',
          lineNumber: 1,
          fieldKey: 'valor_pago',
          range: [78, 92]
        })
      ]
    })
  })
})
