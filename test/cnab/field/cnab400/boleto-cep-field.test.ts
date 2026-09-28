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
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BoletoCepField } from '@cnab/field/cnab400/boleto-cep-field'
import { Cnab400BancoDoBrasilBoletoCepField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/cnab400-banco-do-brasil-boleto-cep-field'
import { Cnab400BradescoBoletoCepField } from '@cnab/bank/bradesco/cnab/cnab400/field/cnab400-bradesco-boleto-cep-field'
import { Cnab400CaixaBoletoCepField } from '@cnab/bank/caixa/cnab/cnab400/field/cnab400-caixa-boleto-cep-field'
import { Cnab400ItauBoletoCepField } from '@cnab/bank/itau/cnab/cnab400/field/cnab400-itau-boleto-cep-field'
import { Cnab400SantanderBoletoCepField } from '@cnab/bank/santander/cnab/cnab400/field/cnab400-santander-boleto-cep-field'
import { Cnab400SicoobBoletoCepField } from '@cnab/bank/sicoob/cnab/cnab400/field/cnab400-sicoob-boleto-cep-field'
import { Cnab400SicrediBoletoCepField } from '@cnab/bank/sicredi/cnab/cnab400/field/cnab400-sicredi-boleto-cep-field'

type CepFieldClass = new (rawLine: string, lineNumber: number) => Cnab400BoletoCepField

describe('Cnab400BoletoCepField', (): void => {
  describe('shouldValidate', (): void => {
    describe('para os 6 bancos com registro de detalhe padrao (comeca com 1)', (): void => {
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

          const field = new Cnab400BradescoBoletoCepField(rawLine, 1)

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

          const field = new Cnab400BancoDoBrasilBoletoCepField(rawLine, 1)

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
      { FieldClass: Cnab400BancoDoBrasilBoletoCepField, examplePath: 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM', expectedFirstValue: '78285000' },
      { FieldClass: Cnab400BradescoBoletoCepField, examplePath: 'bradesco/cnab400/bradesco_cnab_400.txt', expectedFirstValue: '29045402' },
      { FieldClass: Cnab400CaixaBoletoCepField, examplePath: 'caixa/cnab400/caixa_cnab_400.REM', expectedFirstValue: '01310100' },
      { FieldClass: Cnab400ItauBoletoCepField, examplePath: 'itau/cnab400/ITAU_cnab_400.REM', expectedFirstValue: '63540000' },
      { FieldClass: Cnab400SantanderBoletoCepField, examplePath: 'santander/cnab400/santander_cnab_400.REM', expectedFirstValue: '78520000' },
      { FieldClass: Cnab400SicoobBoletoCepField, examplePath: 'sicoob/cnab400/sicoob_cnab_400.REM', expectedFirstValue: '01310100' },
      { FieldClass: Cnab400SicrediBoletoCepField, examplePath: 'sicredi/cnab400/sicredi_cnab_400.REM', expectedFirstValue: '01310100' }
    ])(
      'given detail lines with valid cep ($FieldClass.name) when reading value and validating then accepts all lines',
      ({ FieldClass, examplePath, expectedFirstValue }: {
        FieldClass: CepFieldClass
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
        const results = fields.map((field: Cnab400BoletoCepField) => field.validate())

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
    const examplePath = 'bradesco/cnab400/bradesco_cnab_400.txt'

    it('given detail line with blank cep when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400BradescoBoletoCepField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab400BradescoBoletoCepField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })

    it('given detail line with non-numeric cep when validating then returns field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400BradescoBoletoCepField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGH')

      // When
      const field = new Cnab400BradescoBoletoCepField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(result.isValid).toBe(false)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
    })
  })
})
