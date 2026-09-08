import * as path from 'path'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabGenericFieldError, CnabFieldInvalidNumberError, CnabFieldEmptyValueError } from '@cnab/type/cnab-validation-error'
import { Cnab240SicoobBoletoValorTituloField } from '@cnab/bank/sicoob/cnab/cnab240/field/cnab240-sicoob-boleto-valor-titulo-field'
import { readExampleLines, replaceLineRange, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange } from '@test/test-utils'

describe('Cnab240SicoobBoletoValorTituloField', (): void => {
  const examplePath = 'sicoob/cnab240/sicoob_cnab_240.txt'

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
          throw new Error(`Linha com segmento ${segment} não encontrada`)
        }

        const field = new Cnab240SicoobBoletoValorTituloField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse and validate', (): void => {
    it('given segment P lines with valid amount when parsing and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab240SicoobBoletoValorTituloField),
        Cnab240SicoobBoletoValorTituloField
      )

      const results = fields.map((field: Cnab240SicoobBoletoValorTituloField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].parse()).toBe(10000)
      expect(fields[0].value).toBe(10000)

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate with error', (): void => {
    it('given segment P line with blank amount when validating then returns null value and field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240SicoobBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo valor titulo inválido: deve ser maior que zero',
        lineNumber: dummyLineNumber,
        fieldName: 'valor titulo',
        range: fieldRange
      })

      // When
      const field = new Cnab240SicoobBoletoValorTituloField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(() => field.parse()).toThrow(CnabFieldEmptyValueError)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].message).toBe(expectedError.message)
      expect(result.errors[0].lineNumber).toBe(expectedError.lineNumber)
    })

    it('given segment P line with zero amount when validating then returns error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240SicoobBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '000000000000000')

      // When
      const field = new Cnab240SicoobBoletoValorTituloField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBe(0)
      expect(result.isValid).toBe(false)
    })

    it('given segment P line with invalid alphanumeric value when parsing then throws error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240SicoobBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLMNO')

      // When / Then
      const field = new Cnab240SicoobBoletoValorTituloField(invalidLine, dummyLineNumber)
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.parse()).toThrow(CnabFieldInvalidNumberError)
    })

    it('given segment P line with invalid alphanumeric value when validating then returns format error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240SicoobBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLMNO')

      // When
      const field = new Cnab240SicoobBoletoValorTituloField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.validate()).not.toThrow()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].message).toBe('Campo valor titulo com formato inválido: ABCDEFGHIJKLMNO')
      expect(result.errors[0].lineNumber).toBe(dummyLineNumber)
    })
  })
})
