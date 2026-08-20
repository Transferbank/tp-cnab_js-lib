import * as path from 'path'
import { resPath } from '@test/conftest'
import { describe, it, expect } from '@jest/globals'
import * as TestUtils from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BradescoBoletoValorTituloField } from '@cnab/bank/bradesco/cnab/cnab400/field/cnab400-bradesco-boleto-valor-titulo-field'

describe('Cnab400BradescoBoletoValorTituloField', (): void => {
  const examplePath = path.join(resPath(), 'bradesco/cnab400/bradesco_cnab_400.txt')

  describe('shouldValidate', (): void => {
    describe.each([
      { recordType: '0', expectedShouldValidate: false },
      { recordType: '1', expectedShouldValidate: true },
      { recordType: '2', expectedShouldValidate: false },
      { recordType: '9', expectedShouldValidate: false }
    ])('casos parametrizados', ({ recordType, expectedShouldValidate }): void => {
      it(`dado tipo de registro ${recordType} quando verificar shouldValidate então retorna ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = TestUtils.readExampleLines(examplePath)
        const rawLine = TestUtils.findFirstCnab400RecordLine(lines, recordType)!

        // When
        const shouldValidate = Cnab400BradescoBoletoValorTituloField.shouldValidate(rawLine)

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse e validate', (): void => {
    it('dado linhas de boleto com valor titulo válido quando parsear e validar então aceita todas as linhas', (): void => {
      // Given
      const lines = TestUtils.readExampleLines(examplePath)
      const validatableLines = TestUtils.filterValidatableLines(lines, Cnab400BradescoBoletoValorTituloField)
      
      const fields = validatableLines.map(({ rawLine, lineNumber }: { rawLine: string; lineNumber: number }) => 
        new Cnab400BradescoBoletoValorTituloField({ rawLine, lineNumber })
      )
      const results = fields.map((field: Cnab400BradescoBoletoValorTituloField) => field.validate())

      // Then
      expect(validatableLines.length).toBeGreaterThan(0)
      expect(fields[0].parse()).toBe('22560.93')
      expect(fields[0].value).toBe('22560.93')
      
      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate com erro', (): void => {
    it('dado linha de boleto com valor titulo alfanumérico quando validar então retorna erro de campo', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = TestUtils.getFieldRange(Cnab400BradescoBoletoValorTituloField)
      
      const lines = TestUtils.readExampleLines(examplePath)
      const rawLine = TestUtils.findFirstCnab400RecordLine(lines, '1')!

      const invalidLine = TestUtils.replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLM')
      
      const expectedError = new CnabGenericFieldError({
        message: 'Campo valor titulo inválido: deve conter apenas números',
        lineNumber: dummyLineNumber,
        fieldName: 'valor titulo',
        range: fieldRange
      })

      // When
      const field = new Cnab400BradescoBoletoValorTituloField({
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
