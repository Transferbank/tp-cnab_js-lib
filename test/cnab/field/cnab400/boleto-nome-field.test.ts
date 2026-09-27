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
import { Cnab400BoletoNomeField } from '@cnab/field/cnab400/boleto-nome-field'
import { Cnab400BancoDoBrasilBoletoNomeField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/cnab400-banco-do-brasil-boleto-nome-field'
import { Cnab400BradescoBoletoNomeField } from '@cnab/bank/bradesco/cnab/cnab400/field/cnab400-bradesco-boleto-nome-field'
import { Cnab400CaixaBoletoNomeField } from '@cnab/bank/caixa/cnab/cnab400/field/cnab400-caixa-boleto-nome-field'
import { Cnab400ItauBoletoNomeField } from '@cnab/bank/itau/cnab/cnab400/field/cnab400-itau-boleto-nome-field'
import { Cnab400SantanderBoletoNomeField } from '@cnab/bank/santander/cnab/cnab400/field/cnab400-santander-boleto-nome-field'
import { Cnab400SicoobBoletoNomeField } from '@cnab/bank/sicoob/cnab/cnab400/field/cnab400-sicoob-boleto-nome-field'
import { Cnab400SicrediBoletoNomeField } from '@cnab/bank/sicredi/cnab/cnab400/field/cnab400-sicredi-boleto-nome-field'

type NomeFieldClass = new (rawLine: string, lineNumber: number) => Cnab400BoletoNomeField

// Cada banco tem sua propria classe (Cnab400<Banco>BoletoNomeField), todas herdando de
// Cnab400BoletoNomeField. Ha duas divergencias reais aqui: o range tem 3 variantes (Itau
// [235,264], Banco do Brasil [235,271], os outros 5 [235,274]) e o shouldValidate do
// Banco do Brasil usa um registro de detalhe CNAB400 nao-padrao comecando com '7' em vez
// de '1' - por isso ele tem seu proprio bloco de shouldValidate, separado dos outros 6.
describe('Cnab400BoletoNomeField', (): void => {
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

          const field = new Cnab400BradescoBoletoNomeField(rawLine, 1)

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

          const field = new Cnab400BancoDoBrasilBoletoNomeField(rawLine, 1)

          // When
          const shouldValidate = field.shouldValidate()

          // Then
          expect(shouldValidate).toBe(expectedShouldValidate)
        })
      })
    })
  })

  describe('range', (): void => {
    it('given Itau and Banco do Brasil then each overrides the base range differently', (): void => {
      // Then
      expect(getFieldRange(Cnab400ItauBoletoNomeField)).toEqual([235, 264])
      expect(getFieldRange(Cnab400BancoDoBrasilBoletoNomeField)).toEqual([235, 271])
      expect(getFieldRange(Cnab400BradescoBoletoNomeField)).toEqual([235, 274])
      expect(getFieldRange(Cnab400CaixaBoletoNomeField)).toEqual([235, 274])
      expect(getFieldRange(Cnab400SantanderBoletoNomeField)).toEqual([235, 274])
      expect(getFieldRange(Cnab400SicoobBoletoNomeField)).toEqual([235, 274])
      expect(getFieldRange(Cnab400SicrediBoletoNomeField)).toEqual([235, 274])
    })
  })

  describe('value and validate', (): void => {
    it.each([
      { FieldClass: Cnab400BancoDoBrasilBoletoNomeField, examplePath: 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM', expectedFirstName: 'COMERCIAL ALFA LTDA' },
      { FieldClass: Cnab400BradescoBoletoNomeField, examplePath: 'bradesco/cnab400/bradesco_cnab_400.txt', expectedFirstName: 'COMERCIAL ALFA LTDA' },
      { FieldClass: Cnab400CaixaBoletoNomeField, examplePath: 'caixa/cnab400/caixa_cnab_400.REM', expectedFirstName: 'JOAO DA SILVA EXEMPLO' },
      { FieldClass: Cnab400ItauBoletoNomeField, examplePath: 'itau/cnab400/ITAU_cnab_400.REM', expectedFirstName: 'JOAO EXEMPLO SILVA - ME' },
      { FieldClass: Cnab400SantanderBoletoNomeField, examplePath: 'santander/cnab400/santander_cnab_400.REM', expectedFirstName: 'COMERCIAL ALFA LTDA' },
      { FieldClass: Cnab400SicoobBoletoNomeField, examplePath: 'sicoob/cnab400/sicoob_cnab_400.REM', expectedFirstName: 'JOAO DA SILVA EXEMPLO' },
      { FieldClass: Cnab400SicrediBoletoNomeField, examplePath: 'sicredi/cnab400/sicredi_cnab_400.REM', expectedFirstName: 'COMERCIAL ALFA LTDA' }
    ])(
      'given detail lines with valid name ($FieldClass.name) when reading value and validating then accepts all lines',
      ({ FieldClass, examplePath, expectedFirstName }: {
        FieldClass: NomeFieldClass
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
        const results = fields.map((field: Cnab400BoletoNomeField) => field.validate())

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
    const examplePath = 'bradesco/cnab400/bradesco_cnab_400.txt'

    it('given detail line with blank name when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400BradescoBoletoNomeField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab400BradescoBoletoNomeField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabFieldMinLengthError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })

    it('given detail line with name shorter than minLength when validating then returns error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400BradescoBoletoNomeField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, 'AB')

      // When
      const field = new Cnab400BradescoBoletoNomeField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(result.isValid).toBe(false)
    })
  })
})
