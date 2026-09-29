import * as path from 'path'
import assert from 'node:assert'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import {
  readExampleLines,
  replaceLineRange,
  realLineNumber,
  findFirstCnab400RecordLine,
  filterValidatableLines,
  createFieldsFromLines,
  getFieldRange
} from '@test/test-utils'
import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError, CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BoletoVencimentoField } from '@cnab/field/cnab400/boleto-vencimento-field'

describe('Cnab400BoletoVencimentoField', (): void => {
  describe('shouldValidate', (): void => {
    describe('para o registro de detalhe padrao (comeca com 1)', (): void => {
      const examplePath = 'bradesco/cnab400/bradesco_cnab_400.txt'

      describe.each([
        { recordType: '0', expectedShouldValidate: false },
        { recordType: '1', expectedShouldValidate: true },
        { recordType: '9', expectedShouldValidate: false }
      ])('parameterized cases', ({ recordType, expectedShouldValidate }): void => {
        it(`given record type ${recordType} when checking shouldValidate then returns ${expectedShouldValidate}`, (): void => {
          // Given
          const lines = readExampleLines(path.join(resPath(), examplePath))
          const rawLine = findFirstCnab400RecordLine(lines, recordType)

          if (rawLine == null) {
            assert.fail(`Linha com tipo de registro ${recordType} não encontrada`)
          }

          const FieldClass = Cnab400BoletoVencimentoField()
          const field = new FieldClass(rawLine, 1)

          // When
          const shouldValidate = field.shouldValidate()

          // Then
          expect(shouldValidate).toBe(expectedShouldValidate)
        })
      })
    })

    describe('para o Banco do Brasil, cujo registro de detalhe comeca com 7', (): void => {
      const examplePath = 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM'

      describe.each([
        { recordType: '0', expectedShouldValidate: false },
        { recordType: '7', expectedShouldValidate: true },
        { recordType: '9', expectedShouldValidate: false }
      ])('parameterized cases', ({ recordType, expectedShouldValidate }): void => {
        it(`given record type ${recordType} when checking shouldValidate then returns ${expectedShouldValidate}`, (): void => {
          // Given
          const lines = readExampleLines(path.join(resPath(), examplePath))
          const rawLine = findFirstCnab400RecordLine(lines, recordType)

          if (rawLine == null) {
            assert.fail(`Linha com tipo de registro ${recordType} não encontrada`)
          }

          const FieldClass = Cnab400BoletoVencimentoField('7')
          const field = new FieldClass(rawLine, 1)

          // When
          const shouldValidate = field.shouldValidate()

          // Then
          expect(shouldValidate).toBe(expectedShouldValidate)
        })
      })
    })
  })

  describe('value and validate', (): void => {
    it.each([
      { FieldClass: Cnab400BoletoVencimentoField('7'), examplePath: 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM', expectedFirstValue: new Date(2026, 6, 20) },
      { FieldClass: Cnab400BoletoVencimentoField(), examplePath: 'bradesco/cnab400/bradesco_cnab_400.txt', expectedFirstValue: new Date(2026, 7, 24) },
      { FieldClass: Cnab400BoletoVencimentoField(), examplePath: 'caixa/cnab400/caixa_cnab_400.REM', expectedFirstValue: new Date(2026, 7, 15) },
      { FieldClass: Cnab400BoletoVencimentoField(), examplePath: 'itau/cnab400/ITAU_cnab_400.REM', expectedFirstValue: new Date(2026, 6, 6) },
      { FieldClass: Cnab400BoletoVencimentoField(), examplePath: 'santander/cnab400/santander_cnab_400.REM', expectedFirstValue: new Date(2026, 5, 21) },
      { FieldClass: Cnab400BoletoVencimentoField(), examplePath: 'sicoob/cnab400/sicoob_cnab_400.REM', expectedFirstValue: new Date(2026, 7, 15) },
      { FieldClass: Cnab400BoletoVencimentoField(), examplePath: 'sicredi/cnab400/sicredi_cnab_400.REM', expectedFirstValue: new Date(2026, 5, 21) }
    ])(
      'given detail lines with valid due date ($examplePath) when reading value and validating then accepts all lines',
      ({ FieldClass, examplePath, expectedFirstValue }: {
        FieldClass: CnabFieldClass<Date>
        examplePath: string
        expectedFirstValue: Date
      }): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const fields = createFieldsFromLines(
          filterValidatableLines(lines, FieldClass),
          FieldClass
        )

        // When
        const results = fields.map((field: CnabField<Date>) => field.validate())

        // Then
        expect(fields.length).toBeGreaterThan(0)
        expect(fields[0].value).toEqual(expectedFirstValue)

        results.forEach((result: CnabValidationResult) => {
          expect(result).toEqual(genValidCnabValidationResult())
        })
      }
    )
  })

  describe('validate with error', (): void => {
    const examplePath = 'bradesco/cnab400/bradesco_cnab_400.txt'

    it('given detail line with blank date when validating then returns null value and field error', (): void => {
      // Given
      const FieldClass = Cnab400BoletoVencimentoField()
      const fieldRange = getFieldRange(FieldClass)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
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

    it('given detail line with invalid date when reading value then throws error', (): void => {
      // Given
      const FieldClass = Cnab400BoletoVencimentoField()
      const fieldRange = getFieldRange(FieldClass)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '999999')

      // When
      const field = new FieldClass(invalidLine, lineNumber)

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.value).toThrow(CnabFieldInvalidDateError)
    })

    it('given detail line with invalid date when validating then returns format error', (): void => {
      // Given
      const FieldClass = Cnab400BoletoVencimentoField()
      const fieldRange = getFieldRange(FieldClass)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '999999')

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
