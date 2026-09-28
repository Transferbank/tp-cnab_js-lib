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
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BoletoBairroField } from '@cnab/field/cnab400/boleto-bairro-field'
import { Cnab400BancoDoBrasilBoletoBairroField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/cnab400-banco-do-brasil-boleto-bairro-field'
import { Cnab400CaixaBoletoBairroField } from '@cnab/bank/caixa/cnab/cnab400/field/cnab400-caixa-boleto-bairro-field'
import { Cnab400ItauBoletoBairroField } from '@cnab/bank/itau/cnab/cnab400/field/cnab400-itau-boleto-bairro-field'
import { Cnab400SantanderBoletoBairroField } from '@cnab/bank/santander/cnab/cnab400/field/cnab400-santander-boleto-bairro-field'
import { Cnab400SicoobBoletoBairroField } from '@cnab/bank/sicoob/cnab/cnab400/field/cnab400-sicoob-boleto-bairro-field'

type BairroFieldClass = new (rawLine: string, lineNumber: number) => Cnab400BoletoBairroField

// Cada banco tem sua propria classe (Cnab400<Banco>BoletoBairroField), todas herdando de
// Cnab400BoletoBairroField. Duas divergencias reais: o Banco do Brasil sobrescreve
// shouldValidate (registro de detalhe nao-padrao comecando com '7'); e o Sicoob
// sobrescreve range (desloca pra 312 pra compensar o endereco de 37 posicoes). Bradesco
// e Sicredi nao tem esse campo no CNAB400.
describe('Cnab400BoletoBairroField', (): void => {
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

          const field = new Cnab400CaixaBoletoBairroField(rawLine, 1)

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

          const field = new Cnab400BancoDoBrasilBoletoBairroField(rawLine, 1)

          // When
          const shouldValidate = field.shouldValidate()

          // Then
          expect(shouldValidate).toBe(expectedShouldValidate)
        })
      })
    })
  })

  describe('range', (): void => {
    it('given Sicoob then overrides the base range to compensate for the shorter endereco field', (): void => {
      // Then
      expect(getFieldRange(Cnab400SicoobBoletoBairroField)).toEqual([312, 326])
      expect(getFieldRange(Cnab400BancoDoBrasilBoletoBairroField)).toEqual([315, 326])
      expect(getFieldRange(Cnab400CaixaBoletoBairroField)).toEqual([315, 326])
      expect(getFieldRange(Cnab400ItauBoletoBairroField)).toEqual([315, 326])
      expect(getFieldRange(Cnab400SantanderBoletoBairroField)).toEqual([315, 326])
    })
  })

  describe('value and validate', (): void => {
    it.each([
      { FieldClass: Cnab400BancoDoBrasilBoletoBairroField, examplePath: 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM', expectedFirstValue: 'JARDIM UNIVE' },
      { FieldClass: Cnab400CaixaBoletoBairroField, examplePath: 'caixa/cnab400/caixa_cnab_400.REM', expectedFirstValue: 'CENTRO' },
      { FieldClass: Cnab400ItauBoletoBairroField, examplePath: 'itau/cnab400/ITAU_cnab_400.REM', expectedFirstValue: 'CENTRO' },
      { FieldClass: Cnab400SantanderBoletoBairroField, examplePath: 'santander/cnab400/santander_cnab_400.REM', expectedFirstValue: 'CENTRO' },
      { FieldClass: Cnab400SicoobBoletoBairroField, examplePath: 'sicoob/cnab400/sicoob_cnab_400.REM', expectedFirstValue: 'CENTRO' }
    ])(
      'given detail lines with valid bairro ($FieldClass.name) when reading value and validating then accepts all lines',
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
        const results = fields.map((field: Cnab400BoletoBairroField) => field.validate())

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

    it('given detail line with blank bairro when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400CaixaBoletoBairroField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab400CaixaBoletoBairroField(invalidLine, lineNumber)
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
