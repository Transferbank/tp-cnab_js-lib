import * as path from 'path'
import assert from 'node:assert'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { Cnab240BoletoUfField } from '@cnab/field/cnab240/boleto-uf-field'
import {
  readExampleLines, replaceLineRange, realLineNumber, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange
} from '@test/test-utils'

describe('Cnab240BoletoUfField', (): void => {
  describe('shouldValidate', (): void => {
    const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

    describe.each([
      { segment: 'P', expectedShouldValidate: false },
      { segment: 'Q', expectedShouldValidate: true },
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

        const field = new Cnab240BoletoUfField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it.each([
      { examplePath: 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', expectedFirstValue: 'SP' },
      { examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt', expectedFirstValue: 'SP' },
      { examplePath: 'caixa/cnab240/caixa_cnab_240.txt', expectedFirstValue: 'SP' },
      { examplePath: 'itau/cnab240/itau_cnab_240.txt', expectedFirstValue: 'SP' },
      { examplePath: 'santander/cnab240/santander_cnab_240.txt', expectedFirstValue: 'SP' },
      { examplePath: 'sicoob/cnab240/sicoob_cnab_240.txt', expectedFirstValue: 'SP' },
      { examplePath: 'sicredi/cnab240/sicredi_cnab_240.txt', expectedFirstValue: 'SP' }
    ])(
      'given segment Q lines with valid uf ($examplePath) when reading value and validating then accepts all lines',
      ({ examplePath, expectedFirstValue }: {
        examplePath: string
        expectedFirstValue: string
      }): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const fields = createFieldsFromLines(
          filterValidatableLines(lines, Cnab240BoletoUfField),
          Cnab240BoletoUfField
        )

        // When
        const results = fields.map((field: Cnab240BoletoUfField) => field.validate())

        // Then
        expect(fields.length).toBeGreaterThan(0)
        expect(fields[0].value).toBe(expectedFirstValue)

        results.forEach((result: CnabValidationResult) => {
          expect(result).toEqual(genValidCnabValidationResult())
        })
      }
    )
  })

  describe('validate with error', (): void => {
    const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

    it('given segment Q line with blank uf when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240BoletoUfField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        assert.fail('Linha segmento Q não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab240BoletoUfField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })

    it('given segment Q line with only one letter of uf when validating then returns field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240BoletoUfField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        assert.fail('Linha segmento Q não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, 'S')

      // When
      const field = new Cnab240BoletoUfField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
    })
  })
})
