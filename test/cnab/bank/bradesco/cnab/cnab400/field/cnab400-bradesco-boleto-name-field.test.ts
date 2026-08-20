import * as path from 'path'
import { resPath } from '@test/conftest'
import { describe, it, expect } from '@jest/globals'
import * as TestUtils from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BradescoBoletoNameField } from '@cnab/bank/bradesco/cnab/cnab400/field/cnab400-bradesco-boleto-name-field'

describe('Cnab400BradescoBoletoNameField', (): void => {
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
        const shouldValidate = Cnab400BradescoBoletoNameField.shouldValidate(rawLine)

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse e validate', (): void => {
    it('dado linhas de boleto com nome válido quando parsear e validar então aceita todas as linhas', (): void => {
      // Given
      const lines = TestUtils.readExampleLines(examplePath)
      const validatableLines = TestUtils.filterValidatableLines(lines, Cnab400BradescoBoletoNameField)
      const fields = TestUtils.createFieldsFromLines(validatableLines, Cnab400BradescoBoletoNameField)
      const results = fields.map((field: Cnab400BradescoBoletoNameField) => field.validate())

      // Then
      expect(validatableLines.length).toBeGreaterThan(0)
      expect(fields[0].parse()).toBe('COMERCIAL ALFA LTDA')
      expect(fields[0].value).toBe('COMERCIAL ALFA LTDA')
      
      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate com erro', (): void => {
    it('dado linha de boleto com nome em branco quando validar então retorna erro de campo', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = TestUtils.getFieldRange(Cnab400BradescoBoletoNameField)

      const lines = TestUtils.readExampleLines(examplePath)
      const rawLine = TestUtils.findFirstCnab400RecordLine(lines, '1')!

      const invalidLine = TestUtils.replaceLineRange(rawLine, fieldRange, '')

      const expectedError = new CnabFieldMinLengthError({
        lineNumber: dummyLineNumber,
        fieldName: 'nome do sacado',
        range: fieldRange,
        minLength: 3
      })

      // When
      const field = new Cnab400BradescoBoletoNameField({
        rawLine: invalidLine,
        lineNumber: dummyLineNumber
      })
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.parse()).toBe('')
      expect(field.value).toBe(null)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabFieldMinLengthError)
      expect(result.errors[0].message).toBe(expectedError.message)
      expect(result.errors[0].lineNumber).toBe(expectedError.lineNumber)
    })
  })
})
