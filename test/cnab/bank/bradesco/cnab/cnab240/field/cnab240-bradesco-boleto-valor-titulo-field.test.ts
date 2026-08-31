import * as path from 'path'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { 
  readExampleLines, 
  replaceLineRange,
  findFirstCnab240SegmentLine,
  filterValidatableLines,
  createFieldsFromLines,
  getFieldRange
} from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { 
  CnabFieldInvalidNumberError, 
  CnabFieldEmptyValueError,
  CnabGenericFieldError
} from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BradescoBoletoValorTituloField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-valor-titulo-field'

describe('Cnab240BradescoBoletoValorTituloField', (): void => {
  const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

  describe('shouldValidate', (): void => {
    describe.each([
      { segment: 'P', expectedShouldValidate: true },
      { segment: 'Q', expectedShouldValidate: false },
      { segment: 'R', expectedShouldValidate: false },
      { segment: 'S', expectedShouldValidate: false }
    ])('parameterized cases', ({ segment, expectedShouldValidate }): void => {
      it(`given segment ${segment} when checking shouldValidate then returns ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = findFirstCnab240SegmentLine(lines, segment)

        if (rawLine == null) {
          throw new Error(`Linha com segmento ${segment} não encontrada`)
        }

        const field = new Cnab240BradescoBoletoValorTituloField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse and validate', (): void => {
    it('given segment P lines with valid title value when parsing and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab240BradescoBoletoValorTituloField),
        Cnab240BradescoBoletoValorTituloField
      )

      const results = fields.map((field: Cnab240BradescoBoletoValorTituloField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].parse()).toBe(100)
      expect(fields[0].value).toBe(100)
      
      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate with error', (): void => {
    it('given segment P line with blank value when validating then throws error and returns null value', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When / Then
      const field = new Cnab240BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.parse()).toThrow(CnabFieldEmptyValueError)
      expect(field.value).toBe(null)
    })

    it('given segment P line with invalid alphanumeric value when validating then throws error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLM')

      // When / Then
      const field = new Cnab240BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.parse()).toThrow(CnabFieldInvalidNumberError)
    })

    it('given segment P line with zero value when validating then returns field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '000000000000000')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo valor titulo inválido: deve ser maior que zero',
        lineNumber: dummyLineNumber,
        fieldName: 'valor titulo',
        range: fieldRange
      })

      // When
      const field = new Cnab240BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
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
