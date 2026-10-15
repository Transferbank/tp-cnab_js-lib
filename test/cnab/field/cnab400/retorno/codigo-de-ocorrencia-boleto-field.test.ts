import { describe, it, expect } from '@jest/globals'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { cnab400RetornoLine, replaceLineRange } from '@test/test-utils'
import { CodigoDeOcorrenciaBoletoField } from '@cnab/field/cnab400/retorno/codigo-de-ocorrencia-boleto-field'

describe('CodigoDeOcorrenciaBoletoField', (): void => {
  it('given a detail record when reading then returns the code as written', (): void => {
    // Given
    const field = new CodigoDeOcorrenciaBoletoField(replaceLineRange(cnab400RetornoLine('1'), [109, 110], '06'), 1)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe('06')
  })

  it.each([
    ['blank', '  '],
    ['invalid character', '6#']
  ])('given a detail record with %s code when validating then returns field error', (_: string, code: string): void => {
    // Given
    const field = new CodigoDeOcorrenciaBoletoField(replaceLineRange(cnab400RetornoLine('1'), [109, 110], code), 1)

    // When
    const result = field.validate()

    // Then
    expect(result).toEqual({
      isValid: false,
      errors: [
        new CnabGenericFieldError({
          message: 'Campo código de ocorrência inválido: deve conter 2 letras maiúsculas ou dígitos',
          lineNumber: 1,
          fieldKey: 'codigo_de_ocorrencia',
          range: [109, 110]
        })
      ]
    })
  })
})
