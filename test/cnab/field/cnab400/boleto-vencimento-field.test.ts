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
import { CnabFieldInvalidDateError, CnabFieldEmptyValueError, CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BoletoVencimentoField } from '@cnab/field/cnab400/boleto-vencimento-field'
import { Cnab400BancoDoBrasilBoletoVencimentoField } from '@cnab/bank/banco-do-brasil/cnab/cnab400/field/cnab400-banco-do-brasil-boleto-vencimento-field'
import { Cnab400BradescoBoletoVencimentoField } from '@cnab/bank/bradesco/cnab/cnab400/field/cnab400-bradesco-boleto-vencimento-field'
import { Cnab400CaixaBoletoVencimentoField } from '@cnab/bank/caixa/cnab/cnab400/field/cnab400-caixa-boleto-vencimento-field'
import { Cnab400ItauBoletoVencimentoField } from '@cnab/bank/itau/cnab/cnab400/field/cnab400-itau-boleto-vencimento-field'
import { Cnab400SantanderBoletoVencimentoField } from '@cnab/bank/santander/cnab/cnab400/field/cnab400-santander-boleto-vencimento-field'
import { Cnab400SicoobBoletoVencimentoField } from '@cnab/bank/sicoob/cnab/cnab400/field/cnab400-sicoob-boleto-vencimento-field'
import { Cnab400SicrediBoletoVencimentoField } from '@cnab/bank/sicredi/cnab/cnab400/field/cnab400-sicredi-boleto-vencimento-field'

type VencimentoFieldClass = new (rawLine: string, lineNumber: number) => Cnab400BoletoVencimentoField

// Cada banco tem sua propria classe (Cnab400<Banco>BoletoVencimentoField), todas
// herdando de Cnab400BoletoVencimentoField. A unica divergencia real e o shouldValidate
// do Banco do Brasil, que usa um registro de detalhe CNAB400 nao-padrao comecando com
// '7' em vez de '1' - por isso ele tem seu proprio bloco de shouldValidate, separado dos
// outros 6. performValidation e parseValue sao herdados por todos sem excecao, entao os
// casos de erro rodam uma unica vez (com a classe do Bradesco).
describe('Cnab400BoletoVencimentoField', (): void => {
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

          const field = new Cnab400BradescoBoletoVencimentoField(rawLine, 1)

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

          const field = new Cnab400BancoDoBrasilBoletoVencimentoField(rawLine, 1)

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
      { FieldClass: Cnab400BancoDoBrasilBoletoVencimentoField, examplePath: 'banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM', expectedFirstDate: new Date(2026, 6, 20) },
      { FieldClass: Cnab400BradescoBoletoVencimentoField, examplePath: 'bradesco/cnab400/bradesco_cnab_400.txt', expectedFirstDate: new Date(2026, 7, 24) },
      { FieldClass: Cnab400CaixaBoletoVencimentoField, examplePath: 'caixa/cnab400/caixa_cnab_400.REM', expectedFirstDate: new Date(2026, 7, 15) },
      { FieldClass: Cnab400ItauBoletoVencimentoField, examplePath: 'itau/cnab400/ITAU_cnab_400.REM', expectedFirstDate: new Date(2026, 6, 6) },
      { FieldClass: Cnab400SantanderBoletoVencimentoField, examplePath: 'santander/cnab400/santander_cnab_400.REM', expectedFirstDate: new Date(2026, 5, 21) },
      { FieldClass: Cnab400SicoobBoletoVencimentoField, examplePath: 'sicoob/cnab400/sicoob_cnab_400.REM', expectedFirstDate: new Date(2026, 7, 15) },
      { FieldClass: Cnab400SicrediBoletoVencimentoField, examplePath: 'sicredi/cnab400/sicredi_cnab_400.REM', expectedFirstDate: new Date(2026, 5, 21) }
    ])(
      'given detail lines with valid due date ($FieldClass.name) when parsing and validating then accepts all lines',
      ({ FieldClass, examplePath, expectedFirstDate }: {
        FieldClass: VencimentoFieldClass
        examplePath: string
        expectedFirstDate: Date
      }): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const fields = createFieldsFromLines(
          filterValidatableLines(lines, FieldClass),
          FieldClass
        )

        const results = fields.map((field: Cnab400BoletoVencimentoField) => field.validate())

        // Then
        expect(fields.length).toBeGreaterThan(0)
        expect(fields[0].parse()).toEqual(expectedFirstDate)
        expect(fields[0].value).toEqual(expectedFirstDate)

        results.forEach((result: CnabValidationResult) => {
          expect(result).toEqual(genValidCnabValidationResult())
        })
      }
    )
  })

  describe('validate with error', (): void => {
    const examplePath = 'bradesco/cnab400/bradesco_cnab_400.txt'

    it('given detail line with blank due date when validating then returns null value and field error', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = getFieldRange(Cnab400BradescoBoletoVencimentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo data de vencimento é obrigatório',
        lineNumber: dummyLineNumber,
        fieldName: 'data de vencimento',
        range: fieldRange
      })

      // When
      const field = new Cnab400BradescoBoletoVencimentoField(invalidLine, dummyLineNumber)
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

    it('given detail line with invalid date when validating then throws error', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = getFieldRange(Cnab400BradescoBoletoVencimentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '999999')

      // When / Then
      const field = new Cnab400BradescoBoletoVencimentoField(invalidLine, dummyLineNumber)
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.parse()).toThrow(CnabFieldInvalidDateError)
    })
  })
})
