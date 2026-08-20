import * as path from 'path'
import { resPath } from '@test/conftest'
import { describe, it, expect } from '@jest/globals'
import * as TestUtils from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BradescoBoletoNossoNumeroField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-nosso-numero-field'

describe('Cnab240BradescoBoletoNossoNumeroField', (): void => {
  const examplePath = path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')

  describe('shouldValidate', (): void => {
    describe.each([
      { segment: 'P', expectedShouldValidate: true },
      { segment: 'Q', expectedShouldValidate: false },
      { segment: 'R', expectedShouldValidate: false },
      { segment: 'S', expectedShouldValidate: false }
    ])('casos parametrizados', ({ segment, expectedShouldValidate }): void => {
      it(`dado segmento ${segment} quando verificar shouldValidate então retorna ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = TestUtils.readExampleLines(examplePath)
        const rawLine = TestUtils.findFirstCnab240SegmentLine(lines, segment)!

        // When
        const shouldValidate = Cnab240BradescoBoletoNossoNumeroField.shouldValidate(rawLine)

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse e validate', (): void => {
    it('dado linhas segmento P com nosso numero válido quando parsear e validar então aceita todas as linhas', (): void => {
      // Given
      const lines = TestUtils.readExampleLines(examplePath)
      const validatableLines = TestUtils.filterValidatableLines(lines, Cnab240BradescoBoletoNossoNumeroField)
      
      const fields = validatableLines.map(({ rawLine, lineNumber }: { rawLine: string; lineNumber: number }) => 
        new Cnab240BradescoBoletoNossoNumeroField({ rawLine, lineNumber })
      )
      const results = fields.map((field: Cnab240BradescoBoletoNossoNumeroField) => field.validate())

      // Then
      expect(validatableLines.length).toBeGreaterThan(0)
      expect(fields[0].parse()).toBe('0000123450010')
      expect(fields[0].value).toBe('0000123450010')
      
      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate com erro', (): void => {
    it('dado linha segmento P com nosso numero alfanumérico quando validar então retorna erro de campo', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = TestUtils.getFieldRange(Cnab240BradescoBoletoNossoNumeroField)
      
      const lines = TestUtils.readExampleLines(examplePath)
      const rawLine = TestUtils.findFirstCnab240SegmentLine(lines, 'P')!

      const invalidLine = TestUtils.replaceLineRange(rawLine, fieldRange, 'ABC12345XYZ')
      
      const expectedError = new CnabGenericFieldError({
        message: 'Campo nosso numero inválido: deve conter apenas números',
        lineNumber: dummyLineNumber,
        fieldName: 'nosso numero',
        range: fieldRange
      })

      // When
      const field = new Cnab240BradescoBoletoNossoNumeroField({
        rawLine: invalidLine,
        lineNumber: dummyLineNumber
      })
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.parse()).toBe('ABC12345XYZ')
      expect(field.value).toBe('ABC12345XYZ')
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].message).toBe(expectedError.message)
      expect(result.errors[0].lineNumber).toBe(expectedError.lineNumber)
    })
  })
})
