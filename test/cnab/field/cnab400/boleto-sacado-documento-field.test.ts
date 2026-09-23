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
import { CnabGenericFieldError, CnabFieldEmptyValueError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BoletoSacadoDocumentoField } from '@cnab/field/cnab400/boleto-sacado-documento-field'
import { Cnab400BancoDoBrasilBoletoSacadoDocumentoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/cnab400-banco-do-brasil-boleto-sacado-documento-field'
import { Cnab400BradescoBoletoSacadoDocumentoField } from '@cnab/bank/bradesco/cnab/cnab400/field/cnab400-bradesco-boleto-sacado-documento-field'
import { Cnab400CaixaBoletoSacadoDocumentoField } from '@cnab/bank/caixa/cnab/cnab400/field/cnab400-caixa-boleto-sacado-documento-field'
import { Cnab400ItauBoletoSacadoDocumentoField } from '@cnab/bank/itau/cnab/cnab400/field/cnab400-itau-boleto-sacado-documento-field'
import { Cnab400SantanderBoletoSacadoDocumentoField } from '@cnab/bank/santander/cnab/cnab400/field/cnab400-santander-boleto-sacado-documento-field'
import { Cnab400SicoobBoletoSacadoDocumentoField } from '@cnab/bank/sicoob/cnab/cnab400/field/cnab400-sicoob-boleto-sacado-documento-field'
import { Cnab400SicrediBoletoSacadoDocumentoField } from '@cnab/bank/sicredi/cnab/cnab400/field/cnab400-sicredi-boleto-sacado-documento-field'

type DocumentoFieldClass = new (rawLine: string, lineNumber: number) => Cnab400BoletoSacadoDocumentoField

// Cada banco tem sua propria classe (Cnab400<Banco>BoletoSacadoDocumentoField), todas
// herdando de Cnab400BoletoSacadoDocumentoField. A unica divergencia real e o
// shouldValidate do Banco do Brasil, que usa um registro de detalhe CNAB400 nao-padrao
// comecando com '7' em vez de '1' - por isso ele tem seu proprio bloco de shouldValidate,
// separado dos outros 6. performValidation e parseValue sao herdados por todos sem
// excecao, entao os casos de erro rodam uma unica vez (com a classe do Bradesco).
describe('Cnab400BoletoSacadoDocumentoField', (): void => {
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

          const field = new Cnab400BradescoBoletoSacadoDocumentoField(rawLine, 1)

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

          const field = new Cnab400BancoDoBrasilBoletoSacadoDocumentoField(rawLine, 1)

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
      { FieldClass: Cnab400BancoDoBrasilBoletoSacadoDocumentoField, examplePath: 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM', expectedFirstDocument: '01000000997396' },
      { FieldClass: Cnab400BradescoBoletoSacadoDocumentoField, examplePath: 'bradesco/cnab400/bradesco_cnab_400.txt', expectedFirstDocument: '20000000997330' },
      { FieldClass: Cnab400CaixaBoletoSacadoDocumentoField, examplePath: 'caixa/cnab400/caixa_cnab_400.REM', expectedFirstDocument: '00011122233396' },
      { FieldClass: Cnab400ItauBoletoSacadoDocumentoField, examplePath: 'itau/cnab400/ITAU_cnab_400.REM', expectedFirstDocument: '30000997300020' },
      { FieldClass: Cnab400SantanderBoletoSacadoDocumentoField, examplePath: 'santander/cnab400/santander_cnab_400.REM', expectedFirstDocument: '40000997300084' },
      { FieldClass: Cnab400SicoobBoletoSacadoDocumentoField, examplePath: 'sicoob/cnab400/sicoob_cnab_400.REM', expectedFirstDocument: '00011122233396' },
      { FieldClass: Cnab400SicrediBoletoSacadoDocumentoField, examplePath: 'sicredi/cnab400/sicredi_cnab_400.REM', expectedFirstDocument: '40000997300084' }
    ])(
      'given detail lines with valid document ($FieldClass.name) when parsing and validating then accepts all lines',
      ({ FieldClass, examplePath, expectedFirstDocument }: {
        FieldClass: DocumentoFieldClass
        examplePath: string
        expectedFirstDocument: string
      }): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const fields = createFieldsFromLines(
          filterValidatableLines(lines, FieldClass),
          FieldClass
        )

        const results = fields.map((field: Cnab400BoletoSacadoDocumentoField) => field.validate())

        // Then
        expect(fields.length).toBeGreaterThan(0)
        expect(fields[0].parse()).toBe(expectedFirstDocument)
        expect(fields[0].value).toBe(expectedFirstDocument)

        results.forEach((result: CnabValidationResult) => {
          expect(result).toEqual(genValidCnabValidationResult())
        })
      }
    )

    it('given detail line with a zero-padded CPF when validating then accepts it', (): void => {
      // Given
      const examplePath = 'bradesco/cnab400/bradesco_cnab_400.txt'
      const dummyLineNumber = 7
      const fieldRange = getFieldRange(Cnab400BradescoBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      // CPF 123.456.789-09 gravado à direita num campo de 14 posições
      const lineWithCpf = replaceLineRange(rawLine, fieldRange, '00012345678909')

      // When
      const field = new Cnab400BradescoBoletoSacadoDocumentoField(lineWithCpf, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(field.value).toBe('00012345678909')
      expect(result).toEqual(genValidCnabValidationResult())
    })
  })

  describe('validate with error', (): void => {
    const examplePath = 'bradesco/cnab400/bradesco_cnab_400.txt'

    it('given detail line with blank document when validating then returns null value and field error', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = getFieldRange(Cnab400BradescoBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo documento do sacado inválido: deve ser CPF ou CNPJ válido',
        lineNumber: dummyLineNumber,
        fieldName: 'documento do sacado',
        range: fieldRange
      })

      // When
      const field = new Cnab400BradescoBoletoSacadoDocumentoField(invalidLine, dummyLineNumber)
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

    it('given detail line with invalid document when validating then returns field error', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = getFieldRange(Cnab400BradescoBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '00000000000000')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo documento do sacado inválido: deve ser CPF ou CNPJ válido',
        lineNumber: dummyLineNumber,
        fieldName: 'documento do sacado',
        range: fieldRange
      })

      // When
      const field = new Cnab400BradescoBoletoSacadoDocumentoField(invalidLine, dummyLineNumber)
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
