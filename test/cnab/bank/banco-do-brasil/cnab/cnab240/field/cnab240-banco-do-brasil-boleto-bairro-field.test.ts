import * as path from 'path'
import assert from 'node:assert'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'
import { Cnab240BancoDoBrasilBoletoBairroField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/cnab240-banco-do-brasil-boleto-bairro-field'
import { readExampleLines, replaceLineRange, realLineNumber, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange } from '@test/test-utils'

describe('Cnab240BancoDoBrasilBoletoBairroField', (): void => {
  const examplePath = 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt'

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
          assert.fail(`Linha com segmento ${segment} não encontrada`)
        }

        const field = new Cnab240BancoDoBrasilBoletoBairroField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it('given segment Q lines with valid bairro when reading value and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab240BancoDoBrasilBoletoBairroField),
        Cnab240BancoDoBrasilBoletoBairroField
      )

      const results = fields.map((field: Cnab240BancoDoBrasilBoletoBairroField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].value).toBe('CENTRO')

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })

    it('given segment Q line with bairro longer than the treated range when reading value then truncates to 12 characters', (): void => {
      // Given: nota do manual - "São tratadas somente 12 posições, da posição 114 a 125" -
      // "JARDIM AMERICA" (14 caracteres) é o único bairro do fixture maior que isso.
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const qLines = lines.filter(line => line.length >= 14 && line[7] === '3' && line[13] === 'Q')
      const rawLine = qLines[1]

      if (rawLine == null) {
        assert.fail('Segunda linha segmento Q não encontrada')
      }

      // When
      const field = new Cnab240BancoDoBrasilBoletoBairroField(rawLine, realLineNumber(lines, rawLine))

      // Then
      expect(field.value).toBe('JARDIM AMERI') // CA são cortados porque o manual diz que apenas 12 caracteres sao tratados
    })
  })

  describe('validate with error', (): void => {
    it('given segment Q line with blank bairro when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240BancoDoBrasilBoletoBairroField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        assert.fail('Linha segmento Q não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab240BancoDoBrasilBoletoBairroField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabFieldMinLengthError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })
  })
})
