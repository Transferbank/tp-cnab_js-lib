import * as path from 'path'
import assert from 'node:assert'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabGenericFieldError, CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'
import { Cnab240SicrediBoletoValorTituloField } from '@cnab/bank/sicredi/cnab/cnab240/field/cnab240-sicredi-boleto-valor-titulo-field'
import { readExampleLines, replaceLineRange, realLineNumber, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange } from '@test/test-utils'

describe('Cnab240SicrediBoletoValorTituloField', (): void => {
  const examplePath = 'sicredi/cnab240/sicredi_cnab_240.txt'

  describe('shouldValidate', (): void => {
    describe.each([
      { segment: 'P', expectedShouldValidate: true },
      { segment: 'Q', expectedShouldValidate: false },
      { segment: 'R', expectedShouldValidate: false }
    ])('parameterized cases', ({ segment, expectedShouldValidate }): void => {
      it(`given segment ${segment} when checking shouldValidate then returns ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = findFirstCnab240SegmentLine(lines, segment)

        if (rawLine == null) {
          assert.fail(`Linha com segmento ${segment} não encontrada`)
        }

        const field = new Cnab240SicrediBoletoValorTituloField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it('given segment P lines with valid amount when reading value and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab240SicrediBoletoValorTituloField),
        Cnab240SicrediBoletoValorTituloField
      )

      const results = fields.map((field: Cnab240SicrediBoletoValorTituloField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].value).toBe(1234.50)

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate with error', (): void => {
    it('given segment P line with blank amount when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240SicrediBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab240SicrediBoletoValorTituloField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })

    it('given segment P line with zero amount when validating then returns error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240SicrediBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '000000000000000')

      // When
      const field = new Cnab240SicrediBoletoValorTituloField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBe(0)
      expect(result.isValid).toBe(false)
    })

    it('given segment P line with invalid alphanumeric value when reading value then throws error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240SicrediBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLMNO')

      // When
      const field = new Cnab240SicrediBoletoValorTituloField(invalidLine, lineNumber)

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.value).toThrow(CnabFieldInvalidNumberError)
    })

    it('given segment P line with invalid alphanumeric value when validating then returns format error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240SicrediBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLMNO')

      // When
      const field = new Cnab240SicrediBoletoValorTituloField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })
  })
})
