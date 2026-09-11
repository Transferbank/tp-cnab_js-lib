import * as path from 'path'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import {
  readExampleLines,
  replaceLineRange,
  findFirstCnab240SegmentLine,
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
import { Cnab240BoletoValorTituloField } from '@cnab/field/cnab240/boleto-valor-titulo-field'
import { Cnab240BancoDoBrasilBoletoValorTituloField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/cnab240-banco-do-brasil-boleto-valor-titulo-field'
import { Cnab240BradescoBoletoValorTituloField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-valor-titulo-field'
import { Cnab240CaixaBoletoValorTituloField } from '@cnab/bank/caixa/cnab/cnab240/field/cnab240-caixa-boleto-valor-titulo-field'
import { Cnab240ItauBoletoValorTituloField } from '@cnab/bank/itau/cnab/cnab240/field/cnab240-itau-boleto-valor-titulo-field'
import { Cnab240SantanderBoletoValorTituloField } from '@cnab/bank/santander/cnab/cnab240/field/cnab240-santander-boleto-valor-titulo-field'
import { Cnab240SicoobBoletoValorTituloField } from '@cnab/bank/sicoob/cnab/cnab240/field/cnab240-sicoob-boleto-valor-titulo-field'
import { Cnab240SicrediBoletoValorTituloField } from '@cnab/bank/sicredi/cnab/cnab240/field/cnab240-sicredi-boleto-valor-titulo-field'

type ValorTituloFieldClass = new (rawLine: string, lineNumber: number) => Cnab240BoletoValorTituloField

// Cada banco tem sua propria classe (Cnab240<Banco>BoletoValorTituloField), mas todas
// herdam de Cnab240BoletoValorTituloField sem sobrescrever nada - hoje range, mensagem e
// comportamento sao identicos nos 7. O caminho feliz roda a classe de cada banco contra o
// arquivo de exemplo real dele; os casos de erro (em branco, zero, alfanumerico) so
// precisam rodar uma vez (aqui com a classe do Bradesco), ja que testam a base herdada,
// nao algo especifico de banco.
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
          throw new Error(`Linha com segmento ${segment} não encontrada`)
        }

        const field = new Cnab240BradescoBoletoValorTituloField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse and validate', (): void => {
    it.each([
      { FieldClass: Cnab240BancoDoBrasilBoletoValorTituloField, examplePath: 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', expectedFirstValue: 1234.50 },
      { FieldClass: Cnab240BradescoBoletoValorTituloField, examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt', expectedFirstValue: 100 },
      { FieldClass: Cnab240CaixaBoletoValorTituloField, examplePath: 'caixa/cnab240/caixa_cnab_240.txt', expectedFirstValue: 1234.50 },
      { FieldClass: Cnab240ItauBoletoValorTituloField, examplePath: 'itau/cnab240/itau_cnab_240.txt', expectedFirstValue: 10000 },
      { FieldClass: Cnab240SantanderBoletoValorTituloField, examplePath: 'santander/cnab240/santander_cnab_240.txt', expectedFirstValue: 1234.50 },
      { FieldClass: Cnab240SicoobBoletoValorTituloField, examplePath: 'sicoob/cnab240/sicoob_cnab_240.txt', expectedFirstValue: 10000 },
      { FieldClass: Cnab240SicrediBoletoValorTituloField, examplePath: 'sicredi/cnab240/sicredi_cnab_240.txt', expectedFirstValue: 1234.50 }
    ])(
      'given segment P lines with valid title value ($FieldClass.name) when parsing and validating then accepts all lines',
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

        const results = fields.map((field: Cnab240BoletoValorTituloField) => field.validate())

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
    const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

    it('given segment P line with blank value when validating then returns null value and field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo valor do título inválido: deve ser maior que zero',
        lineNumber: dummyLineNumber,
        fieldName: 'valor do título',
        range: fieldRange
      })

      // When
      const field = new Cnab240BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
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

    it('given segment P line with invalid alphanumeric value when validating then throws error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLM')

      // When / Then
      const field = new Cnab240BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.parse()).toThrow(CnabFieldInvalidNumberError)
    })

    it('given segment P line with zero value when validating then returns field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '000000000000000')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo valor do título inválido: deve ser maior que zero',
        lineNumber: dummyLineNumber,
        fieldName: 'valor do título',
        range: fieldRange
      })

      // When
      const field = new Cnab240BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].message).toBe(expectedError.message)
      expect(result.errors[0].lineNumber).toBe(expectedError.lineNumber)
    })
  })
})
