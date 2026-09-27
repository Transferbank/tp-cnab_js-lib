import * as path from 'path'
import assert from 'node:assert'
import { describe, it, expect } from '@jest/globals'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab240BoletoNomeField } from '@cnab/field/cnab240/boleto-nome-field'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'
import { Cnab240ItauBoletoNomeField } from '@cnab/bank/itau/cnab/cnab240/field/cnab240-itau-boleto-nome-field'
import { Cnab240CaixaBoletoNomeField } from '@cnab/bank/caixa/cnab/cnab240/field/cnab240-caixa-boleto-nome-field'
import { Cnab240SicoobBoletoNomeField } from '@cnab/bank/sicoob/cnab/cnab240/field/cnab240-sicoob-boleto-nome-field'
import { Cnab240SicrediBoletoNomeField } from '@cnab/bank/sicredi/cnab/cnab240/field/cnab240-sicredi-boleto-nome-field'
import { Cnab240BradescoBoletoNomeField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-nome-field'
import { Cnab240SantanderBoletoNomeField } from '@cnab/bank/santander/cnab/cnab240/field/cnab240-santander-boleto-nome-field'
import { Cnab240BancoDoBrasilBoletoNomeField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/cnab240-banco-do-brasil-boleto-nome-field'
import {
  readExampleLines, replaceLineRange, resPath, realLineNumber,
  findFirstCnab240SegmentLine, filterValidatableLines, createFieldsFromLines, getFieldRange
} from '@test/test-utils'

type NomeFieldClass = new (rawLine: string, lineNumber: number) => Cnab240BoletoNomeField

// Cada banco tem sua propria classe (Cnab240<Banco>BoletoNomeField), todas herdando de
// Cnab240BoletoNomeField. Diferente do valor do titulo, aqui ha divergencia real: o Itau
// sobrescreve o range.
describe('Cnab240BoletoNomeField', (): void => {
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

        const field = new Cnab240BradescoBoletoNomeField(rawLine, 1)

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
      expect(getFieldRange(Cnab240ItauBoletoNomeField)).toEqual([34, 63])
      expect(getFieldRange(Cnab240BradescoBoletoNomeField)).toEqual([34, 73])
      expect(getFieldRange(Cnab240BancoDoBrasilBoletoNomeField)).toEqual([34, 73])
      expect(getFieldRange(Cnab240CaixaBoletoNomeField)).toEqual([34, 73])
      expect(getFieldRange(Cnab240SantanderBoletoNomeField)).toEqual([34, 73])
      expect(getFieldRange(Cnab240SicoobBoletoNomeField)).toEqual([34, 73])
      expect(getFieldRange(Cnab240SicrediBoletoNomeField)).toEqual([34, 73])
    })
  })

  describe('value and validate', (): void => {
    it.each([
      { FieldClass: Cnab240BancoDoBrasilBoletoNomeField, examplePath: 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', expectedFirstName: 'JOAO DA SILVA EXEMPLO' },
      { FieldClass: Cnab240BradescoBoletoNomeField, examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' },
      { FieldClass: Cnab240CaixaBoletoNomeField, examplePath: 'caixa/cnab240/caixa_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' },
      { FieldClass: Cnab240ItauBoletoNomeField, examplePath: 'itau/cnab240/itau_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' },
      { FieldClass: Cnab240SantanderBoletoNomeField, examplePath: 'santander/cnab240/santander_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' },
      { FieldClass: Cnab240SicoobBoletoNomeField, examplePath: 'sicoob/cnab240/sicoob_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' },
      { FieldClass: Cnab240SicrediBoletoNomeField, examplePath: 'sicredi/cnab240/sicredi_cnab_240.txt', expectedFirstName: 'JOAO EXEMPLO SILVA' }
    ])(
      'given segment Q lines with valid name ($FieldClass.name) when reading value and validating then accepts all lines',
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
        const results = fields.map((field: Cnab240BoletoNomeField) => field.validate())

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
      const fieldRange = getFieldRange(Cnab240BradescoBoletoNomeField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        assert.fail('Linha segmento Q não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab240BradescoBoletoNomeField(invalidLine, lineNumber)
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
