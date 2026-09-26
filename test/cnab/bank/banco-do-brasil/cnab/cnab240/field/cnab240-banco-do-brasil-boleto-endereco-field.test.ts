import * as path from 'path'
import assert from 'node:assert'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BancoDoBrasilBoletoEnderecoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/cnab240-banco-do-brasil-boleto-endereco-field'
import { readExampleLines, replaceLineRange, realLineNumber, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange } from '@test/test-utils'

describe('Cnab240BancoDoBrasilBoletoEnderecoField', (): void => {
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

        const field = new Cnab240BancoDoBrasilBoletoEnderecoField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it('given segment Q lines with valid address when reading value and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab240BancoDoBrasilBoletoEnderecoField),
        Cnab240BancoDoBrasilBoletoEnderecoField
      )

      const results = fields.map((field: Cnab240BancoDoBrasilBoletoEnderecoField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].value).toBe('RUA DAS FLORES 100 APTO 12')

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate as optional field', (): void => {
    it('given segment Q line with blank address when validating then returns null value and no error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240BancoDoBrasilBoletoEnderecoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        assert.fail('Linha segmento Q não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const blankLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab240BancoDoBrasilBoletoEnderecoField(blankLine, lineNumber)
      const result = field.validate()

      // Then
      expect(blankLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result).toEqual(genValidCnabValidationResult())
    })
  })
})
