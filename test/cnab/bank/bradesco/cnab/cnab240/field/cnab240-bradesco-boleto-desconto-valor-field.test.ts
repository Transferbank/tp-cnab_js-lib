import * as path from 'path'
import { resPath } from '@test/conftest'
import { describe, it, expect } from '@jest/globals'
import * as TestUtils from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BradescoBoletoDescontoValorField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-desconto-valor-field'

describe('Cnab240BradescoBoletoDescontoValorField', (): void => {
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
        const shouldValidate = Cnab240BradescoBoletoDescontoValorField.shouldValidate(rawLine)

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse e validate', (): void => {
    it('dado linhas segmento P com valor desconto válido quando parsear e validar então aceita todas as linhas', (): void => {
      // Given
      const lines = TestUtils.readExampleLines(examplePath)
      const validatableLines = TestUtils.filterValidatableLines(lines, Cnab240BradescoBoletoDescontoValorField)
      
      const fields = validatableLines.map(({ rawLine, lineNumber }: { rawLine: string; lineNumber: number }) => 
        new Cnab240BradescoBoletoDescontoValorField({ rawLine, lineNumber })
      )
      const results = fields.map((field: Cnab240BradescoBoletoDescontoValorField) => field.validate())

      // Then
      expect(validatableLines.length).toBeGreaterThan(0)
      expect(fields[0].parse()).toBe('0.00')
      expect(fields[0].value).toBe('0.00')
      
      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate com erro', (): void => {
    it('dado linha segmento P com valor desconto alfanumérico quando validar então retorna erro de campo', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = TestUtils.getFieldRange(Cnab240BradescoBoletoDescontoValorField)
      
      const lines = TestUtils.readExampleLines(examplePath)
      const rawLine = TestUtils.findFirstCnab240SegmentLine(lines, 'P')!

      const invalidLine = TestUtils.replaceLineRange(rawLine, fieldRange, 'ABC12345XYZ')
      
      const expectedError = new CnabGenericFieldError({
        message: 'Campo valor desconto inválido: deve conter apenas números',
        lineNumber: dummyLineNumber,
        fieldName: 'valor desconto',
        range: fieldRange
      })

      // When
      const field = new Cnab240BradescoBoletoDescontoValorField({
        rawLine: invalidLine,
        lineNumber: dummyLineNumber
      })
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].message).toBe(expectedError.message)
      expect(result.errors[0].lineNumber).toBe(expectedError.lineNumber)
    })
  })
})
