import * as path from 'path'
import assert from 'node:assert'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BoletoSacadoDocumentoField } from '@cnab/field/cnab240/boleto-sacado-documento-field'
import { Cnab240ItauBoletoSacadoDocumentoField } from '@cnab/bank/itau/cnab/cnab240/field/cnab240-itau-boleto-sacado-documento-field'
import { Cnab240CaixaBoletoSacadoDocumentoField } from '@cnab/bank/caixa/cnab/cnab240/field/cnab240-caixa-boleto-sacado-documento-field'
import { Cnab240SicoobBoletoSacadoDocumentoField } from '@cnab/bank/sicoob/cnab/cnab240/field/cnab240-sicoob-boleto-sacado-documento-field'
import { Cnab240SicrediBoletoSacadoDocumentoField } from '@cnab/bank/sicredi/cnab/cnab240/field/cnab240-sicredi-boleto-sacado-documento-field'
import { Cnab240BradescoBoletoSacadoDocumentoField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-sacado-documento-field'
import { Cnab240SantanderBoletoSacadoDocumentoField } from '@cnab/bank/santander/cnab/cnab240/field/cnab240-santander-boleto-sacado-documento-field'
import { Cnab240BancoDoBrasilBoletoSacadoDocumentoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/cnab240-banco-do-brasil-boleto-sacado-documento-field'
import {
  readExampleLines, replaceLineRange, realLineNumber, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange
} from '@test/test-utils'

type SacadoDocumentoFieldClass = new (rawLine: string, lineNumber: number) => Cnab240BoletoSacadoDocumentoField

// A base implementa a validação por indicador (posição 18, "1"=CPF/"2"=CNPJ); só BB
// sobrescreve, pelo fallback "0"=CNPJ.
describe('Cnab240BoletoSacadoDocumentoField', (): void => {
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

        const field = new Cnab240BradescoBoletoSacadoDocumentoField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it.each([
      { FieldClass: Cnab240BancoDoBrasilBoletoSacadoDocumentoField, examplePath: 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', expectedFirstDocument: '000011122233396' },
      { FieldClass: Cnab240BradescoBoletoSacadoDocumentoField, examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt', expectedFirstDocument: '000010000791989' },
      { FieldClass: Cnab240CaixaBoletoSacadoDocumentoField, examplePath: 'caixa/cnab240/caixa_cnab_240.txt', expectedFirstDocument: '000011122233396' },
      { FieldClass: Cnab240ItauBoletoSacadoDocumentoField, examplePath: 'itau/cnab240/itau_cnab_240.txt', expectedFirstDocument: '000011122233396' },
      { FieldClass: Cnab240SantanderBoletoSacadoDocumentoField, examplePath: 'santander/cnab240/santander_cnab_240.txt', expectedFirstDocument: '000011122233396' },
      { FieldClass: Cnab240SicoobBoletoSacadoDocumentoField, examplePath: 'sicoob/cnab240/sicoob_cnab_240.txt', expectedFirstDocument: '000011122233396' },
      { FieldClass: Cnab240SicrediBoletoSacadoDocumentoField, examplePath: 'sicredi/cnab240/sicredi_cnab_240.txt', expectedFirstDocument: '000011122233396' }
    ])(
      'given segment Q lines with valid document ($FieldClass.name) when reading value and validating then accepts all lines',
      ({ FieldClass, examplePath, expectedFirstDocument }: {
        FieldClass: SacadoDocumentoFieldClass
        examplePath: string
        expectedFirstDocument: string
      }): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const fields = createFieldsFromLines(
          filterValidatableLines(lines, FieldClass),
          FieldClass
        )

        // When
        const results = fields.map((field: Cnab240BoletoSacadoDocumentoField) => field.validate())

        // Then
        expect(fields.length).toBeGreaterThan(0)
        expect(fields[0].value).toBe(expectedFirstDocument)

        results.forEach((result: CnabValidationResult) => {
          expect(result).toEqual(genValidCnabValidationResult())
        })
      }
    )
  })

  describe('validate with error (validacao por indicador de tipo)', (): void => {
    const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

    it('given segment Q line with blank document when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240BradescoBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        assert.fail('Linha segmento Q não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab240BradescoBoletoSacadoDocumentoField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })

    it('given segment Q line with invalid document when validating then returns field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240BradescoBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        assert.fail('Linha segmento Q não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '000000000000000')

      // When
      const field = new Cnab240BradescoBoletoSacadoDocumentoField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })
  })

  describe('validate with error (Banco do Brasil - indicador "0" tratado como CNPJ)', (): void => {
    const examplePath = 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt'

    it('given segment Q line with indicator "0" and a valid CNPJ when validating then accepts the line', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLines = lines.filter((line: string) => line.length >= 14 && line[7] === '3' && line[13] === 'Q')
      const rawLine = rawLines.find((line: string) => line[17] === '2')

      if (rawLine == null) {
        assert.fail('Linha segmento Q com indicador CNPJ não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const lineWithZeroIndicator = replaceLineRange(rawLine, [18, 18], '0')

      // When
      const field = new Cnab240BancoDoBrasilBoletoSacadoDocumentoField(lineWithZeroIndicator, lineNumber)
      const result = field.validate()

      // Then
      expect(lineWithZeroIndicator.length).toBe(rawLine.length)
      expect(result).toEqual(genValidCnabValidationResult())
    })
  })
})
