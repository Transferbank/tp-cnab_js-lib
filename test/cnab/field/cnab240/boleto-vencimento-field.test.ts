import * as path from 'path'
import assert from 'node:assert'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabGenericFieldError, CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'
import { Cnab240BoletoVencimentoField } from '@cnab/field/cnab240/boleto-vencimento-field'
import {
  readExampleLines, replaceLineRange, realLineNumber, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange
} from '@test/test-utils'

describe('Cnab240BoletoVencimentoField', (): void => {
  describe('shouldValidate', (): void => {
    const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

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
          assert.fail(`Linha com segmento ${segment} não encontrada`)
        }

        const FieldClass = Cnab240BoletoVencimentoField()
        const field = new FieldClass(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it.each([
      { examplePath: 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt' },
      { examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt' },
      { examplePath: 'caixa/cnab240/caixa_cnab_240.txt' },
      { examplePath: 'itau/cnab240/itau_cnab_240.txt' },
      { examplePath: 'santander/cnab240/santander_cnab_240.txt' },
      { examplePath: 'sicoob/cnab240/sicoob_cnab_240.txt' },
      { examplePath: 'sicredi/cnab240/sicredi_cnab_240.txt' }
    ])(
      'given segment P lines with valid due date ($examplePath) when reading value and validating then accepts all lines',
      ({ examplePath }: {
        examplePath: string
      }): void => {
        // Given
        const FieldClass = Cnab240BoletoVencimentoField()
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const fields = createFieldsFromLines(
          filterValidatableLines(lines, FieldClass),
          FieldClass
        )

        // When
        const results = fields.map((field: CnabField<Date>) => field.validate())

        // Then
        expect(fields.length).toBeGreaterThan(0)
        expect(fields[0].value).toEqual(new Date(2026, 11, 15))

        results.forEach((result: CnabValidationResult) => {
          expect(result).toEqual(genValidCnabValidationResult())
        })
      }
    )
  })

  describe('validate with error', (): void => {
    const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

    it('given segment P line with blank date when validating then returns null value and field error', (): void => {
      // Given
      const FieldClass = Cnab240BoletoVencimentoField()
      const fieldRange = getFieldRange(FieldClass)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new FieldClass(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })

    it('given segment P line with invalid date when reading value then throws error', (): void => {
      // Given
      const FieldClass = Cnab240BoletoVencimentoField()
      const fieldRange = getFieldRange(FieldClass)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '99999999')

      // When
      const field = new FieldClass(invalidLine, lineNumber)

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.value).toThrow(CnabFieldInvalidDateError)
    })

    it('given segment P line with invalid date when validating then returns format error', (): void => {
      // Given
      const FieldClass = Cnab240BoletoVencimentoField()
      const fieldRange = getFieldRange(FieldClass)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '99999999')

      // When
      const field = new FieldClass(invalidLine, lineNumber)
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
