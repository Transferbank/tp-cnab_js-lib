import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { NomeBoletoField } from '@cnab/field/cnab240/nome-boleto-field'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'
import {
  readExampleLines, replaceLineRange, resPath, realLineNumber,
  findFirstCnab240SegmentLine, filterValidatableLines, createFieldsFromLines, getFieldRange
} from '@test/test-utils'

// NomeBoletoField e uma factory: sem argumentos usa o range padrao (comum a 6 dos
// 7 bancos); o Itau e o unico com divergencia real e passa seu range menor ([34, 63]).
describe('NomeBoletoField', (): void => {
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

        const FieldClass = NomeBoletoField()
        const field = new FieldClass(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('range', (): void => {
    it('given Itau then overrides the base range to a smaller segment Q slice', (): void => {
      // Then
      expect(getFieldRange(NomeBoletoField(34, 63))).toEqual([34, 63])
      expect(getFieldRange(NomeBoletoField())).toEqual([34, 73])
    })
  })

  describe('value and validate', (): void => {
    it.each([
      { FieldClass: NomeBoletoField(), examplePath: 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', expectedFirstName: 'JOAO DA SILVA EXEMPLO' },
      { FieldClass: NomeBoletoField(), examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' },
      { FieldClass: NomeBoletoField(), examplePath: 'caixa/cnab240/caixa_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' },
      { FieldClass: NomeBoletoField(34, 63), examplePath: 'itau/cnab240/itau_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' },
      { FieldClass: NomeBoletoField(), examplePath: 'santander/cnab240/santander_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' },
      { FieldClass: NomeBoletoField(), examplePath: 'sicoob/cnab240/sicoob_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' },
      { FieldClass: NomeBoletoField(), examplePath: 'sicredi/cnab240/sicredi_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' }
    ])(
      'given segment Q lines with valid name ($examplePath) when reading value and validating then accepts all lines',
      ({ FieldClass, examplePath, expectedFirstName }: {
        FieldClass: CnabFieldClass<string>
        examplePath: string
        expectedFirstName: string
      }): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const fields = createFieldsFromLines(
          filterValidatableLines(lines, FieldClass),
          FieldClass
        )

        // When
        const results = fields.map((field: CnabField<string>) => field.validate())

        // Then
        expect(fields.length).toBeGreaterThan(0)
        expect(fields[0].value).toBe(expectedFirstName)

        results.forEach((result: CnabValidationResult) => {
          expect(result).toEqual(genValidCnabValidationResult())
        })
      }
    )
  })

  describe('validate with error', (): void => {
    const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

    it('given segment Q line with blank name when validating then returns null value and field error', (): void => {
      // Given
      const FieldClass = NomeBoletoField()
      const fieldRange = getFieldRange(FieldClass)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        assert.fail('Linha segmento Q não encontrada')
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
      expect(result.errors[0]).toBeInstanceOf(CnabFieldMinLengthError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })
  })
})
