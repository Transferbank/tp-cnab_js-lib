import * as path from 'path'
import assert from 'node:assert'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabGenericFieldError, CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'
import { Cnab240BoletoValorTituloField } from '@cnab/field/cnab240/boleto-valor-titulo-field'
import {
  readExampleLines, replaceLineRange, realLineNumber, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange
} from '@test/test-utils'

// Cnab240BoletoValorTituloField e uma factory: sem argumentos usa o range padrao. Nenhum
// banco diverge hoje, mas o parametro existe como padrao para caso algum passe a
// divergir no futuro.
describe('Cnab240BoletoValorTituloField', (): void => {
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

        const FieldClass = Cnab240BoletoValorTituloField()
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
      { examplePath: 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', expectedFirstValue: 1234.50 },
      { examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt', expectedFirstValue: 100 },
      { examplePath: 'caixa/cnab240/caixa_cnab_240.txt', expectedFirstValue: 1234.50 },
      { examplePath: 'itau/cnab240/itau_cnab_240.txt', expectedFirstValue: 10000 },
      { examplePath: 'santander/cnab240/santander_cnab_240.txt', expectedFirstValue: 1234.50 },
      { examplePath: 'sicoob/cnab240/sicoob_cnab_240.txt', expectedFirstValue: 10000 },
      { examplePath: 'sicredi/cnab240/sicredi_cnab_240.txt', expectedFirstValue: 1234.50 }
    ])(
      'given segment P lines with valid amount ($examplePath) when reading value and validating then accepts all lines',
      ({ examplePath, expectedFirstValue }: {
        examplePath: string
        expectedFirstValue: number
      }): void => {
        // Given
        const FieldClass = Cnab240BoletoValorTituloField()
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const fields = createFieldsFromLines(
          filterValidatableLines(lines, FieldClass),
          FieldClass
        )

        // When
        const results = fields.map((field: CnabField<number>) => field.validate())

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

    it('given segment P line with blank amount when validating then returns null value and field error', (): void => {
      // Given
      const FieldClass = Cnab240BoletoValorTituloField()
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

    it('given segment P line with zero amount when validating then returns field error', (): void => {
      // Given
      const FieldClass = Cnab240BoletoValorTituloField()
      const fieldRange = getFieldRange(FieldClass)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '000000000000000')

      // When
      const field = new FieldClass(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBe(0)
      expect(result.isValid).toBe(false)
    })

    it('given segment P line with invalid alphanumeric value when reading value then throws error', (): void => {
      // Given
      const FieldClass = Cnab240BoletoValorTituloField()
      const fieldRange = getFieldRange(FieldClass)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLM')

      // When
      const field = new FieldClass(invalidLine, lineNumber)

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.value).toThrow(CnabFieldInvalidNumberError)
    })

    it('given segment P line with digits followed by garbage when reading value then throws error', (): void => {
      // Given: parseInt('00000012345ABCD', 10) retorna 12345 em vez de NaN - sem a
      // checagem de formato, isso passaria como R$123.45 valido.
      const FieldClass = Cnab240BoletoValorTituloField()
      const fieldRange = getFieldRange(FieldClass)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        assert.fail('Linha segmento P não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '00000012345ABCD')

      // When
      const field = new FieldClass(invalidLine, lineNumber)

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.value).toThrow(CnabFieldInvalidNumberError)
    })
  })
})
