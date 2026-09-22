import * as path from 'path'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240ItauBoletoSacadoDocumentoField } from '@cnab/bank/itau/cnab/cnab240/field/cnab240-itau-boleto-sacado-documento-field'
import { assertDefined, readExampleLines, replaceLineRange, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange } from '@test/test-utils'

describe('Cnab240ItauBoletoSacadoDocumentoField', (): void => {
  const examplePath = 'itau/cnab240/itau_cnab_240.txt'

  describe('shouldValidate', (): void => {
    describe.each([
      { segment: 'P', expectedShouldValidate: false },
      { segment: 'Q', expectedShouldValidate: true },
      { segment: 'R', expectedShouldValidate: false }
    ])('parameterized cases', ({ segment, expectedShouldValidate }): void => {
      it(`given segment ${segment} when checking shouldValidate then returns ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = findFirstCnab240SegmentLine(lines, segment)

        assertDefined(rawLine)

        const field = new Cnab240ItauBoletoSacadoDocumentoField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it('given segment Q lines with valid document when reading value and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab240ItauBoletoSacadoDocumentoField),
        Cnab240ItauBoletoSacadoDocumentoField
      )

      const results = fields.map((field: Cnab240ItauBoletoSacadoDocumentoField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].value).toBe('000011122233396')

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate with error', (): void => {
    it('given segment Q line with blank document when validating then returns null value and field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240ItauBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      assertDefined(rawLine)

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab240ItauBoletoSacadoDocumentoField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
    })

    it('given segment Q line with invalid document when validating then returns error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240ItauBoletoSacadoDocumentoField)
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      assertDefined(rawLine)

      const invalidLine = replaceLineRange(rawLine, fieldRange, '000000000000000')

      // When
      const field = new Cnab240ItauBoletoSacadoDocumentoField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
    })
  })
})
