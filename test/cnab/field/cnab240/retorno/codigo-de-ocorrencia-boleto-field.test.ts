import { describe, it, expect } from '@jest/globals'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { cnab240RetornoLine, replaceLineRange } from '@test/test-utils'
import { CodigoDeOcorrenciaBoletoField } from '@cnab/field/cnab240/retorno/codigo-de-ocorrencia-boleto-field'

describe('CodigoDeOcorrenciaBoletoField', (): void => {
  it('given a segment T line when reading then returns the code as written', (): void => {
    // Given
    const field = new CodigoDeOcorrenciaBoletoField(replaceLineRange(cnab240RetornoLine('3', 'T'), [16, 17], '06'), 1)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe('06')
  })

  it('given a segment U line when checking then does not read the field', (): void => {
    // Given
    const field = new CodigoDeOcorrenciaBoletoField(replaceLineRange(cnab240RetornoLine('3', 'U'), [16, 17], '06'), 1)

    // When
    const shouldValidate = field.shouldValidate()

    // Then
    expect(shouldValidate).toBe(false)
  })

  it.each([
    ['blank', '  '],
    ['non numeric', 'A6']
  ])('given a segment T line with %s code when validating then returns field error', (_: string, code: string): void => {
    // Given
    const field = new CodigoDeOcorrenciaBoletoField(replaceLineRange(cnab240RetornoLine('3', 'T'), [16, 17], code), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo código de ocorrência inválido: deve conter 2 dígitos numéricos',
          lineNumber: 1,
          fieldKey: 'codigo_de_ocorrencia',
          range: [16, 17]
        })
      ]
    })
  })
})
