import * as path from 'path'
import { resPath } from '@test/conftest'
import { describe, it, expect } from '@jest/globals'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabGenericFieldError, CnabFieldInvalidDateError, CnabFieldEmptyValueError } from '@cnab/type/cnab-validation-error'
import { Cnab400ItauBoletoVencimentoField } from '@cnab/bank/itau/cnab/cnab400/field/cnab400-itau-boleto-vencimento-field'
import { readExampleLines, replaceLineRange, findFirstCnab400RecordLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange } from '@test/test-utils'

describe('Cnab400ItauBoletoVencimentoField', (): void => {
  const examplePath = 'itau/cnab400/ITAU_cnab_400.REM'

  describe('shouldValidate', (): void => {
    describe.each([
      { recordType: '0', expectedShouldValidate: false },
      { recordType: '1', expectedShouldValidate: true },
      { recordType: '2', expectedShouldValidate: false },
      { recordType: '9', expectedShouldValidate: false }
    ])('parameterized cases', ({ recordType, expectedShouldValidate }): void => {
      it(`given record type ${recordType} when checking shouldValidate then returns ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = findFirstCnab400RecordLine(lines, recordType)

        if (rawLine == null) {
          throw new Error(`Linha com tipo de registro ${recordType} não encontrada`)
        }

        const field = new Cnab400ItauBoletoVencimentoField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse and validate', (): void => {
    it('given detail lines with valid due date when parsing and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab400ItauBoletoVencimentoField),
        Cnab400ItauBoletoVencimentoField
      )

      const results = fields.map((field: Cnab400ItauBoletoVencimentoField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].parse()).toEqual(new Date(2026, 6, 6))
      expect(fields[0].value).toEqual(new Date(2026, 6, 6))

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate with error', (): void => {
    it('given detail line with blank date when validating then returns null value and field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab400ItauBoletoVencimentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha de detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo data de vencimento é obrigatório',
        lineNumber: dummyLineNumber,
        fieldName: 'data de vencimento',
        range: fieldRange
      })

      // When
      const field = new Cnab400ItauBoletoVencimentoField(invalidLine, dummyLineNumber)
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

    it('given detail line with invalid date when parsing then throws error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab400ItauBoletoVencimentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha de detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '999999')

      // When / Then
      const field = new Cnab400ItauBoletoVencimentoField(invalidLine, dummyLineNumber)
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.parse()).toThrow(CnabFieldInvalidDateError)
    })

    it('given detail line with invalid date when validating then returns format error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab400ItauBoletoVencimentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha de detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '999999')

      // When
      const field = new Cnab400ItauBoletoVencimentoField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.validate()).not.toThrow()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].message).toBe('Campo data de vencimento com formato inválido: 999999')
      expect(result.errors[0].lineNumber).toBe(dummyLineNumber)
    })
  })
})
