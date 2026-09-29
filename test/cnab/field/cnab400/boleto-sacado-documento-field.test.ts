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
import { CnabField } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BoletoSacadoDocumentoField } from '@cnab/field/cnab400/boleto-sacado-documento-field'
import { Cnab400BancoDoBrasilBoletoSacadoDocumentoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/cnab400-banco-do-brasil-boleto-sacado-documento-field'
import { Cnab400SicrediBoletoSacadoDocumentoField } from '@cnab/bank/sicredi/cnab/cnab400/field/cnab400-sicredi-boleto-sacado-documento-field'

type SacadoDocumentoFieldClass = new (rawLine: string, lineNumber: number) => Cnab400BoletoSacadoDocumentoField

// BB (registro '7' + "00"=Isento) e Sicredi (indicador de 1 char) precisam sobrescrever
// performValidation, por isso tem subclasse propria em vez de usar a base direto.
describe('Cnab400BoletoSacadoDocumentoField', (): void => {
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

          const field = new Cnab400BoletoSacadoDocumentoField(rawLine, 1)

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

          const field = new Cnab400BancoDoBrasilBoletoSacadoDocumentoField(rawLine, 1)

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
      { FieldClass: Cnab400BancoDoBrasilBoletoSacadoDocumentoField, examplePath: 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM', expectedFirstDocument: '01000000997396' },
      { FieldClass: Cnab400BoletoSacadoDocumentoField, examplePath: 'bradesco/cnab400/bradesco_cnab_400.txt', expectedFirstDocument: '20000000997330' },
      { FieldClass: Cnab400BoletoSacadoDocumentoField, examplePath: 'caixa/cnab400/caixa_cnab_400.REM', expectedFirstDocument: '00011122233396' },
      { FieldClass: Cnab400BoletoSacadoDocumentoField, examplePath: 'itau/cnab400/ITAU_cnab_400.REM', expectedFirstDocument: '30000997300020' },
      { FieldClass: Cnab400BoletoSacadoDocumentoField, examplePath: 'santander/cnab400/santander_cnab_400.REM', expectedFirstDocument: '40000997300084' },
      { FieldClass: Cnab400BoletoSacadoDocumentoField, examplePath: 'sicoob/cnab400/sicoob_cnab_400.REM', expectedFirstDocument: '00011122233396' },
      { FieldClass: Cnab400SicrediBoletoSacadoDocumentoField, examplePath: 'sicredi/cnab400/sicredi_cnab_400.REM', expectedFirstDocument: '40000997300084' }
    ])(
      'given detail lines with valid document ($examplePath) when reading value and validating then accepts all lines',
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
        const results = fields.map((field: CnabField<string>) => field.validate())

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
    const examplePath = 'bradesco/cnab400/bradesco_cnab_400.txt'

    it('given detail line with blank document when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400BoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab400BoletoSacadoDocumentoField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })

    it('given detail line with invalid document when validating then returns field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400BoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '00000000000000')

      // When
      const field = new Cnab400BoletoSacadoDocumentoField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })
  })

  describe('validate with error (Banco do Brasil - indicador "00" isento)', (): void => {
    const examplePath = 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM'

    it('given detail line with indicator "00" and a garbage document when validating then accepts the line', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400BancoDoBrasilBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '7')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const lineWithIsento = replaceLineRange(rawLine, [219, 220], '00')
      const lineWithGarbageDocument = replaceLineRange(lineWithIsento, fieldRange, 'ABCDEFGHIJKLMN')

      // When
      const field = new Cnab400BancoDoBrasilBoletoSacadoDocumentoField(lineWithGarbageDocument, lineNumber)
      const result = field.validate()

      // Then
      expect(lineWithGarbageDocument.length).toBe(rawLine.length)
      expect(result).toEqual(genValidCnabValidationResult())
    })
  })

  describe('validate with error (Sicredi - indicador de 1 char na posicao 219)', (): void => {
    const examplePath = 'sicredi/cnab400/sicredi_cnab_400.REM'

    it('given detail line with blank document when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400SicrediBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab400SicrediBoletoSacadoDocumentoField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].lineNumber).toBe(lineNumber)
    })

    it('given detail line with indicator "2" (CNPJ) but a valid CPF document when validating then returns field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400SicrediBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        assert.fail('Linha detalhe não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '00052998224725')

      // When
      const field = new Cnab400SicrediBoletoSacadoDocumentoField(invalidLine, lineNumber)
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
