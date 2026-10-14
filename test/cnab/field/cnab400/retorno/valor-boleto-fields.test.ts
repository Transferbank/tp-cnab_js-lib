import { describe, it, expect } from '@jest/globals'
import { CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { replaceLineRange } from '@test/test-utils'
import { ValorTituloBoletoField } from '@cnab/field/cnab400/retorno/valor-titulo-boleto-field'
import { ValorPagoBoletoField } from '@cnab/field/cnab400/retorno/valor-pago-boleto-field'
import { JurosMultaBoletoField } from '@cnab/field/cnab400/retorno/juros-multa-boleto-field'

function retornoLine(recordType: string): string {
  return recordType.padEnd(400, ' ')
}

describe.each([
  ['ValorTituloBoletoField', ValorTituloBoletoField, [153, 165]],
  ['ValorPagoBoletoField', ValorPagoBoletoField, [254, 266]],
  ['JurosMultaBoletoField', JurosMultaBoletoField, [267, 279]]
])('%s', (_: string, FieldClass: CnabFieldClass<number>, range: number[]): void => {
  const fieldRange = range as [number, number]

  it('given a filled amount when reading then returns it in reais', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('1'), fieldRange, '0000000123456'), 1)

    // When
    const result = field.validate()

    // Then
    expect(field.shouldValidate()).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(1234.56)
  })

  it('given a zeroed amount when reading then it is absent and valid', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('1'), fieldRange, '0000000000000'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBeNull()
  })

  it('given a header record when checking then does not read the field', (): void => {
    // Given
    const field = new FieldClass(replaceLineRange(retornoLine('0'), fieldRange, '0000000123456'), 1)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })
})

describe('ValorBoletoField', (): void => {
  it('given a non numeric amount when validating then reports an invalid format', (): void => {
    // Given
    const field = new ValorPagoBoletoField(replaceLineRange(retornoLine('1'), [254, 266], '00000001234AB'), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo valor_pago com formato inválido: 00000001234AB',
          lineNumber: 1,
          fieldKey: 'valor_pago',
          range: [254, 266]
        })
      ]
    })
  })
})
