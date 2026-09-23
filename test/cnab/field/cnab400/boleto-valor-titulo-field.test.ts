import * as path from 'path'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import {
  readExampleLines,
  replaceLineRange,
  findFirstCnab400RecordLine,
  filterValidatableLines,
  createFieldsFromLines,
  getFieldRange
} from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import {
  CnabFieldInvalidNumberError,
  CnabFieldEmptyValueError,
  CnabGenericFieldError
} from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BoletoValorTituloField } from '@cnab/field/cnab400/boleto-valor-titulo-field'
import { Cnab400BancoDoBrasilBoletoValorTituloField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/cnab400-banco-do-brasil-boleto-valor-titulo-field'
import { Cnab400BradescoBoletoValorTituloField } from '@cnab/bank/bradesco/cnab/cnab400/field/cnab400-bradesco-boleto-valor-titulo-field'
import { Cnab400CaixaBoletoValorTituloField } from '@cnab/bank/caixa/cnab/cnab400/field/cnab400-caixa-boleto-valor-titulo-field'
import { Cnab400ItauBoletoValorTituloField } from '@cnab/bank/itau/cnab/cnab400/field/cnab400-itau-boleto-valor-titulo-field'
import { Cnab400SantanderBoletoValorTituloField } from '@cnab/bank/santander/cnab/cnab400/field/cnab400-santander-boleto-valor-titulo-field'
import { Cnab400SicoobBoletoValorTituloField } from '@cnab/bank/sicoob/cnab/cnab400/field/cnab400-sicoob-boleto-valor-titulo-field'
import { Cnab400SicrediBoletoValorTituloField } from '@cnab/bank/sicredi/cnab/cnab400/field/cnab400-sicredi-boleto-valor-titulo-field'

type ValorTituloFieldClass = new (rawLine: string, lineNumber: number) => Cnab400BoletoValorTituloField

// Cada banco tem sua propria classe (Cnab400<Banco>BoletoValorTituloField), todas herdando
// de Cnab400BoletoValorTituloField. Diferente do CNAB240, aqui a divergencia real e no
// shouldValidate, nao no range: o Banco do Brasil usa um registro de detalhe que comeca
// com '7' em vez de '1', entao sobrescreve shouldValidate inteiro - por isso ele tem seu
// proprio bloco de shouldValidate, separado dos outros 6. performValidation e parseValue
// sao herdados por todos sem excecao, entao os casos de erro rodam uma unica vez
// (com a classe do Bradesco).
describe('Cnab400BoletoValorTituloField', (): void => {
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
            throw new Error(`Linha com tipo de registro ${recordType} não encontrada`)
          }

          const field = new Cnab400BradescoBoletoValorTituloField(rawLine, 1)

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
            throw new Error(`Linha com tipo de registro ${recordType} não encontrada`)
          }

          const field = new Cnab400BancoDoBrasilBoletoValorTituloField(rawLine, 1)

          // When
          const shouldValidate = field.shouldValidate()

          // Then
          expect(shouldValidate).toBe(expectedShouldValidate)
        })
      })
    })
  })

  describe('parse and validate', (): void => {
    it.each([
      { FieldClass: Cnab400BancoDoBrasilBoletoValorTituloField, examplePath: 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM', expectedFirstValue: 3390.20 },
      { FieldClass: Cnab400BradescoBoletoValorTituloField, examplePath: 'bradesco/cnab400/bradesco_cnab_400.txt', expectedFirstValue: 22560.93 },
      { FieldClass: Cnab400CaixaBoletoValorTituloField, examplePath: 'caixa/cnab400/caixa_cnab_400.REM', expectedFirstValue: 150.00 },
      { FieldClass: Cnab400ItauBoletoValorTituloField, examplePath: 'itau/cnab400/ITAU_cnab_400.REM', expectedFirstValue: 6762.31 },
      { FieldClass: Cnab400SantanderBoletoValorTituloField, examplePath: 'santander/cnab400/santander_cnab_400.REM', expectedFirstValue: 368.12 },
      { FieldClass: Cnab400SicoobBoletoValorTituloField, examplePath: 'sicoob/cnab400/sicoob_cnab_400.REM', expectedFirstValue: 150.00 },
      { FieldClass: Cnab400SicrediBoletoValorTituloField, examplePath: 'sicredi/cnab400/sicredi_cnab_400.REM', expectedFirstValue: 368.12 }
    ])(
      'given detail lines with valid amount ($FieldClass.name) when parsing and validating then accepts all lines',
      ({ FieldClass, examplePath, expectedFirstValue }: {
        FieldClass: ValorTituloFieldClass
        examplePath: string
        expectedFirstValue: number
      }): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const fields = createFieldsFromLines(
          filterValidatableLines(lines, FieldClass),
          FieldClass
        )

        const results = fields.map((field: Cnab400BoletoValorTituloField) => field.validate())

        // Then
        expect(fields.length).toBeGreaterThan(0)
        expect(fields[0].parse()).toBe(expectedFirstValue)
        expect(fields[0].value).toBe(expectedFirstValue)

        results.forEach((result: CnabValidationResult) => {
          expect(result).toEqual(genValidCnabValidationResult())
        })
      }
    )
  })

  describe('validate with error', (): void => {
    const examplePath = 'bradesco/cnab400/bradesco_cnab_400.txt'

    it('given detail line with blank amount when validating then returns null value and field error', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = getFieldRange(Cnab400BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo valor do título inválido: deve ser maior que zero',
        lineNumber: dummyLineNumber,
        fieldName: 'valor do título',
        range: fieldRange
      })

      // When
      const field = new Cnab400BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(() => field.parse()).toThrow(CnabFieldEmptyValueError)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].message).toBe(expectedError.message)
      expect(result.errors[0].lineNumber).toBe(expectedError.lineNumber)
    })

    it('given detail line with zero amount when validating then returns error', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = getFieldRange(Cnab400BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '0000000000000')

      // When
      const field = new Cnab400BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBe(0)
      expect(result.isValid).toBe(false)
    })

    it('given detail line with invalid alphanumeric value when parsing then throws error', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = getFieldRange(Cnab400BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLM')

      // When / Then
      const field = new Cnab400BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.parse()).toThrow(CnabFieldInvalidNumberError)
    })

    it('given detail line with invalid alphanumeric value when validating then returns format error', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = getFieldRange(Cnab400BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLM')

      // When
      const field = new Cnab400BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.validate()).not.toThrow()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].message).toBe('Campo valor do título com formato inválido: ABCDEFGHIJKLM')
      expect(result.errors[0].lineNumber).toBe(dummyLineNumber)
    })
  })
})
