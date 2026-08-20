import * as path from 'path'
import { resPath } from '@test/conftest'
import { describe, it, expect } from '@jest/globals'
import * as TestUtils from '@test/test-utils'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BradescoHeaderDataGeracaoField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-header-data-geracao-field'

describe('Cnab240BradescoHeaderDataGeracaoField', (): void => {
  const examplePath = path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')

  describe('shouldValidate', (): void => {
    it('dado header de arquivo quando verificar shouldValidate então retorna true', (): void => {
      // Given
      const lines = TestUtils.readExampleLines(examplePath)
      const rawLine = lines[0] // Header de arquivo é a primeira linha

      // When
      const shouldValidate = Cnab240BradescoHeaderDataGeracaoField.shouldValidate(rawLine)

      // Then
      expect(shouldValidate).toBe(true)
    })

    it('dado linha que não é header de arquivo quando verificar shouldValidate então retorna false', (): void => {
      // Given
      const lines = TestUtils.readExampleLines(examplePath)
      const rawLine = TestUtils.findFirstCnab240SegmentLine(lines, 'P')!

      // When
      const shouldValidate = Cnab240BradescoHeaderDataGeracaoField.shouldValidate(rawLine)

      // Then
      expect(shouldValidate).toBe(false)
    })
  })

  describe('parse e validate', (): void => {
    it('dado header de arquivo com data de geração válida quando parsear e validar então aceita', (): void => {
      // Given
      const lines = TestUtils.readExampleLines(examplePath)
      const rawLine = lines[0] // Header de arquivo
      const field = new Cnab240BradescoHeaderDataGeracaoField({
        rawLine,
        lineNumber: 1
      })

      // When
      const result = field.validate()

      // Then
      expect(field.parse()).toBe('01072026')
      expect(field.value).toBe('01072026')
      expect(result).toEqual(genValidCnabValidationResult())
    })
  })

  describe('validate com erro', (): void => {
    it('dado header de arquivo com data de geração inválida quando validar então retorna erro de campo', (): void => {
      // Given
      const dummyLineNumber = 1
      const fieldRange = TestUtils.getFieldRange(Cnab240BradescoHeaderDataGeracaoField)
      
      const lines = TestUtils.readExampleLines(examplePath)
      const rawLine = lines[0] // Header de arquivo

      const invalidLine = TestUtils.replaceLineRange(rawLine, fieldRange, '99999999')
      
      const expectedError = new CnabGenericFieldError({
        message: 'Campo data de geração inválido: deve ser data no formato DDMMAAAA',
        lineNumber: dummyLineNumber,
        fieldName: 'data de geração',
        range: fieldRange
      })

      // When
      const field = new Cnab240BradescoHeaderDataGeracaoField({
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
