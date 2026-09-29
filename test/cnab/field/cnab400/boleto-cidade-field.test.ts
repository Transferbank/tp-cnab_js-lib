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
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BoletoCidadeField } from '@cnab/field/cnab400/boleto-cidade-field'

describe('Cnab400BoletoCidadeField', (): void => {
  describe('shouldValidate', (): void => {
    describe('para os bancos com registro de detalhe padrao (comeca com 1)', (): void => {
      const examplePath = 'caixa/cnab400/caixa_cnab_400.REM'

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

          const FieldClass = Cnab400BoletoCidadeField()
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

          const FieldClass = Cnab400BoletoCidadeField('7')
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
      { FieldClass: Cnab400BoletoCidadeField('7'), examplePath: 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM', expectedFirstValue: 'SAO JOSE DOS QU' },
      { FieldClass: Cnab400BoletoCidadeField(), examplePath: 'caixa/cnab400/caixa_cnab_400.REM', expectedFirstValue: 'SAO PAULO' },
      { FieldClass: Cnab400BoletoCidadeField(), examplePath: 'itau/cnab400/ITAU_cnab_400.REM', expectedFirstValue: 'VARZEA ALEGRE' },
      { FieldClass: Cnab400BoletoCidadeField(), examplePath: 'santander/cnab400/santander_cnab_400.REM', expectedFirstValue: 'GUARANTA DO NOR' },
      { FieldClass: Cnab400BoletoCidadeField(), examplePath: 'sicoob/cnab400/sicoob_cnab_400.REM', expectedFirstValue: 'SAO PAULO' }
    ])(
      'given detail lines with valid city ($examplePath) when reading value and validating then accepts all lines',
      ({ FieldClass, examplePath, expectedFirstValue }: {
        FieldClass: CnabFieldClass<string>
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
        const results = fields.map((field: CnabField<string>) => field.validate())

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
    const examplePath = 'caixa/cnab400/caixa_cnab_400.REM'

    it('given detail line with blank city when validating then returns null value and field error', (): void => {
      // Given
      const FieldClass = Cnab400BoletoCidadeField()
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
      expect(result.errors[0]).toBeInstanceOf(CnabFieldMinLengthError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })
  })
})
