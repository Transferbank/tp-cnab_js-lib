import * as path from 'path'
import assert from 'node:assert'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'
import { BairroBoletoField } from '@cnab/field/cnab240/bairro-boleto-field'
import { BairroBoletoField as BancoDoBrasilBairroBoletoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/bairro-boleto-field'
import {
  readExampleLines, replaceLineRange, realLineNumber, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange
} from '@test/test-utils'

type BairroFieldClass = new (rawLine: string, lineNumber: number) => BairroBoletoField

describe('BairroBoletoField', (): void => {
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

        const field = new BairroBoletoField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('range', (): void => {
    it('given Banco do Brasil then overrides the base range to a smaller 12-char slice', (): void => {
      // Then
      expect(getFieldRange(BancoDoBrasilBairroBoletoField)).toEqual([114, 125])
      expect(getFieldRange(BairroBoletoField)).toEqual([114, 128])
    })
  })

  describe('value and validate', (): void => {
    it.each([
      { FieldClass: BancoDoBrasilBairroBoletoField, examplePath: 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', expectedFirstValue: 'CENTRO' },
      { FieldClass: BairroBoletoField, examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt', expectedFirstValue: 'CENTRO' },
      { FieldClass: BairroBoletoField, examplePath: 'caixa/cnab240/caixa_cnab_240.txt', expectedFirstValue: 'CENTRO' },
      { FieldClass: BairroBoletoField, examplePath: 'itau/cnab240/itau_cnab_240.txt', expectedFirstValue: 'CENTRO' },
      { FieldClass: BairroBoletoField, examplePath: 'santander/cnab240/santander_cnab_240.txt', expectedFirstValue: 'CENTRO' },
      { FieldClass: BairroBoletoField, examplePath: 'sicoob/cnab240/sicoob_cnab_240.txt', expectedFirstValue: 'CENTRO' }
    ])(
      'given segment Q lines with valid bairro ($examplePath) when reading value and validating then accepts all lines',
      ({ FieldClass, examplePath, expectedFirstValue }: {
        FieldClass: BairroFieldClass
        examplePath: string
        expectedFirstValue: string
      }): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const fields = createFieldsFromLines(
          filterValidatableLines(lines, FieldClass),
          FieldClass
        )

        // When
        const results = fields.map((field: BairroBoletoField) => field.validate())

        // Then
        expect(fields.length).toBeGreaterThan(0)
        expect(fields[0].value).toBe(expectedFirstValue)

        results.forEach((result: CnabValidationResult) => {
          expect(result).toEqual(genValidCnabValidationResult())
        })
      }
    )

    it('given Bradesco segment Q line with 15-char bairro when reading value then uses the full range', (): void => {
      // Given: "VILA INDUSTRIAL" tem exatamente os 15 caracteres do range - sem nota de
      // truncagem pro Bradesco (diferente do BB), entao o range completo e usado.
      const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, BairroBoletoField),
        BairroBoletoField
      )

      // Then
      expect(fields[2].value).toBe('VILA INDUSTRIAL')
    })

    it('given Banco do Brasil segment Q line with bairro longer than the treated range when reading value then truncates to 12 characters', (): void => {
      // Given: nota do manual - "São tratadas somente 12 posições, da posição 114 a 125" -
      // "JARDIM AMERICA" (14 caracteres) é o único bairro do fixture maior que isso.
      const examplePath = 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt'
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const qLines = lines.filter((line: string) => line.length >= 14 && line[7] === '3' && line[13] === 'Q')
      const rawLine = qLines[1]

      if (rawLine == null) {
        assert.fail('Segunda linha segmento Q não encontrada')
      }

      // When
      const field = new BancoDoBrasilBairroBoletoField(rawLine, realLineNumber(lines, rawLine))

      // Then
      expect(field.value).toBe('JARDIM AMERI')
    })
  })

  describe('validate with error', (): void => {
    const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

    it('given segment Q line with blank bairro when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(BairroBoletoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        assert.fail('Linha segmento Q não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new BairroBoletoField(invalidLine, lineNumber)
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
