import * as path from 'path'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import {
  assertDefined,
  readExampleLines,
  replaceLineRange,
  findFirstCnab240SegmentLine,
  filterValidatableLines,
  createFieldsFromLines,
  getFieldRange
} from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidNumberError, CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
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

        assertDefined(rawLine)

        const field = new Cnab240BradescoBoletoValorTituloField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it('given segment P lines with valid title value when reading value and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab240BradescoBoletoValorTituloField),
        Cnab240BradescoBoletoValorTituloField
      )

      const results = fields.map((field: Cnab240BradescoBoletoValorTituloField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].value).toBe(100)

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate with error', (): void => {
    it('given segment P line with blank value when validating then returns null value and field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      assertDefined(rawLine)

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab240BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
    })

    it('given segment P line with invalid alphanumeric value when validating then throws error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      assertDefined(rawLine)

      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLM')

      // When / Then
      const field = new Cnab240BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.value).toThrow(CnabFieldInvalidNumberError)
    })

    it('given segment P line with zero value when validating then returns field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      assertDefined(rawLine)

      const invalidLine = replaceLineRange(rawLine, fieldRange, '000000000000000')

      // When
      const field = new Cnab240BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
    })
  })
})
