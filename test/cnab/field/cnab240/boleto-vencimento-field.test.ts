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
  CnabFieldInvalidDateError,
  CnabFieldEmptyValueError,
  CnabGenericFieldError
} from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BoletoVencimentoField } from '@cnab/field/cnab240/boleto-vencimento-field'
import { Cnab240BancoDoBrasilBoletoVencimentoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/cnab240-banco-do-brasil-boleto-vencimento-field'
import { Cnab240BradescoBoletoVencimentoField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-vencimento-field'
import { Cnab240CaixaBoletoVencimentoField } from '@cnab/bank/caixa/cnab/cnab240/field/cnab240-caixa-boleto-vencimento-field'
import { Cnab240ItauBoletoVencimentoField } from '@cnab/bank/itau/cnab/cnab240/field/cnab240-itau-boleto-vencimento-field'
import { Cnab240SantanderBoletoVencimentoField } from '@cnab/bank/santander/cnab/cnab240/field/cnab240-santander-boleto-vencimento-field'
import { Cnab240SicoobBoletoVencimentoField } from '@cnab/bank/sicoob/cnab/cnab240/field/cnab240-sicoob-boleto-vencimento-field'
import { Cnab240SicrediBoletoVencimentoField } from '@cnab/bank/sicredi/cnab/cnab240/field/cnab240-sicredi-boleto-vencimento-field'

type VencimentoFieldClass = new (rawLine: string, lineNumber: number) => Cnab240BoletoVencimentoField

// Cada banco tem sua propria classe (Cnab240<Banco>BoletoVencimentoField), todas herdando
// de Cnab240BoletoVencimentoField sem sobrescrever nada - range, fieldName e o parse de
// data (DDMMAAAA) sao identicos nos 7 hoje. O caminho feliz roda a classe de cada banco
// contra o arquivo de exemplo real dele; os casos de erro (em branco, data invalida)
// rodam uma vez com a classe do Bradesco, ja que testam comportamento herdado, nao
// especifico de banco.
describe('Cnab240BoletoVencimentoField', (): void => {
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

        const field = new Cnab240BradescoBoletoVencimentoField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse and validate', (): void => {
    it.each([
      { FieldClass: Cnab240BancoDoBrasilBoletoVencimentoField, examplePath: 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt' },
      { FieldClass: Cnab240BradescoBoletoVencimentoField, examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt' },
      { FieldClass: Cnab240CaixaBoletoVencimentoField, examplePath: 'caixa/cnab240/caixa_cnab_240.txt' },
      { FieldClass: Cnab240ItauBoletoVencimentoField, examplePath: 'itau/cnab240/itau_cnab_240.txt' },
      { FieldClass: Cnab240SantanderBoletoVencimentoField, examplePath: 'santander/cnab240/santander_cnab_240.txt' },
      { FieldClass: Cnab240SicoobBoletoVencimentoField, examplePath: 'sicoob/cnab240/sicoob_cnab_240.txt' },
      { FieldClass: Cnab240SicrediBoletoVencimentoField, examplePath: 'sicredi/cnab240/sicredi_cnab_240.txt' }
    ])(
      'given segment P lines with valid due date ($FieldClass.name) when parsing and validating then accepts all lines',
      ({ FieldClass, examplePath }: { FieldClass: VencimentoFieldClass; examplePath: string }): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const fields = createFieldsFromLines(
          filterValidatableLines(lines, FieldClass),
          FieldClass
        )

        const results = fields.map((field: Cnab240BoletoVencimentoField) => field.validate())

        // Then
        expect(fields.length).toBeGreaterThan(0)
        expect(fields[0].parse()).toEqual(new Date(2026, 11, 15))
        expect(fields[0].value).toEqual(new Date(2026, 11, 15))

        results.forEach((result: CnabValidationResult) => {
          expect(result).toEqual(genValidCnabValidationResult())
        })
      }
    )
  })

  describe('validate with error', (): void => {
    const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

    it('given segment P line with blank date when validating then returns null value and field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240BradescoBoletoVencimentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo data de vencimento é obrigatório',
        lineNumber: dummyLineNumber,
        fieldName: 'data de vencimento',
        range: fieldRange
      })

      // When
      const field = new Cnab240BradescoBoletoVencimentoField(invalidLine, dummyLineNumber)
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

    it('given segment P line with invalid date when validating then throws error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab240BradescoBoletoVencimentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'P')

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '99999999')

      // When / Then
      const field = new Cnab240BradescoBoletoVencimentoField(invalidLine, dummyLineNumber)
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.parse()).toThrow(CnabFieldInvalidDateError)
    })
  })
})
