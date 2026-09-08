import * as path from 'path'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabFieldMinLengthError, CnabFieldEmptyValueError } from '@cnab/type/cnab-validation-error'
import { Cnab240SicoobBoletoNameField } from '@cnab/bank/sicoob/cnab/cnab240/field/cnab240-sicoob-boleto-name-field'
import { readExampleLines, replaceLineRange, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange } from '@test/test-utils'

describe('Cnab240SicoobBoletoNameField', (): void => {
  const examplePath = 'sicoob/cnab240/sicoob_cnab_240.txt'

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

        if (rawLine == null) {
          throw new Error(`Linha com segmento ${segment} não encontrada`)
        }

        const field = new Cnab240SicoobBoletoNameField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse and validate', (): void => {
    it('given segment Q lines with valid name when parsing and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab240SicoobBoletoNameField),
        Cnab240SicoobBoletoNameField
      )

      const results = fields.map((field: Cnab240SicoobBoletoNameField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].parse()).toBe('JOAO EXEMPLO SILVA')
      expect(fields[0].value).toBe('JOAO EXEMPLO SILVA')

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate with error', (): void => {
    it('given segment Q line with blank name when validating then returns null value and field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240SicoobBoletoNameField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        throw new Error('Linha segmento Q não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      const expectedError = new CnabFieldMinLengthError({
        lineNumber: dummyLineNumber,
        fieldName: 'nome do sacado',
        range: fieldRange,
        minLength: 3
      })

      // When
      const field = new Cnab240SicoobBoletoNameField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(() => field.parse()).toThrow(CnabFieldEmptyValueError)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabFieldMinLengthError)
      expect(result.errors[0].lineNumber).toBe(expectedError.lineNumber)
    })

    it('given segment Q line with name shorter than minLength when validating then returns error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240SicoobBoletoNameField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        throw new Error('Linha segmento Q não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, 'AB')

      // When
      const field = new Cnab240SicoobBoletoNameField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(result.isValid).toBe(false)
    })
  })
})
