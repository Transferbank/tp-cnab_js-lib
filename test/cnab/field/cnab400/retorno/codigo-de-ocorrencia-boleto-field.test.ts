import { describe, it, expect } from '@jest/globals'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { cnab400RetornoLine, replaceLineRange } from '@test/test-utils'
import { CodigoDeOcorrenciaBoletoField } from '@cnab/field/cnab400/retorno/codigo-de-ocorrencia-boleto-field'

describe('CodigoDeOcorrenciaBoletoField', (): void => {
  it.each([
    ['digits', '06'],
    ['a letter and a digit', 'P1']
  ])('given a detail record with a code of %s when reading then returns the code as written', (_: string, code: string): void => {
    // Given
    const field = new CodigoDeOcorrenciaBoletoField(replaceLineRange(cnab400RetornoLine('1'), [109, 110], code), 1)

    // When
    const shouldValidate = field.shouldValidate()
    const result = field.validate()

    // Then
    expect(shouldValidate).toBe(true)
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(field.value).toBe(code)
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

  it('given a code when writing then fills only the code range of the line', (): void => {
    // Given
    const rawLine = cnab400RetornoLine('1')
    const line = Array.from(rawLine)
    const field = new CodigoDeOcorrenciaBoletoField(rawLine, 1)

    // When
    field.write(line, '06')

    // Then
    expect(line.join('')).toBe(replaceLineRange(rawLine, [109, 110], '06'))
  })
})
