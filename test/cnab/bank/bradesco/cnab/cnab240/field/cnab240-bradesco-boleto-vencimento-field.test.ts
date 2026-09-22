import * as path from 'path'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import {
  assertDefined,
  readExampleLines,
  replaceLineRange,
  realLineNumber,
  findFirstCnab240SegmentLine,
  filterValidatableLines,
  createFieldsFromLines,
  getFieldRange
} from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidDateError, CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BradescoBoletoVencimentoField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-vencimento-field'

describe('Cnab240BradescoBoletoVencimentoField', (): void => {
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

        assertDefined(rawLine, `Linha com segmento ${segment} não encontrada`)

        const field = new Cnab240BradescoBoletoVencimentoField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it('given segment P lines with valid due date when reading value and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab240BradescoBoletoVencimentoField),
        Cnab240BradescoBoletoVencimentoField
      )

      const results = fields.map((field: Cnab240BradescoBoletoVencimentoField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].value).toEqual(new Date(2026, 11, 15))

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate with error', (): void => {
    it('given segment P line with blank date when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240BradescoBoletoVencimentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      assertDefined(rawLine, 'Linha segmento P não encontrada')

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab240BradescoBoletoVencimentoField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })

    it('given segment P line with invalid date when validating then throws error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240BradescoBoletoVencimentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      assertDefined(rawLine, 'Linha segmento P não encontrada')

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '99999999')

      // When / Then
      const field = new Cnab240BradescoBoletoVencimentoField(invalidLine, lineNumber)
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.value).toThrow(CnabFieldInvalidDateError)
    })
  })
})
