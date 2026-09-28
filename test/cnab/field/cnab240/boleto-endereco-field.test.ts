import * as path from 'path'
import assert from 'node:assert'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import { CnabField } from '@cnab/type/cnab-field'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'
import { Cnab240BoletoEnderecoField } from '@cnab/field/cnab240/boleto-endereco-field'
import { Cnab240BancoDoBrasilBoletoEnderecoField } from '@cnab/bank/banco-do-brasil/cnab/cnab240/field/cnab240-banco-do-brasil-boleto-endereco-field'
import {
  readExampleLines, replaceLineRange, realLineNumber, findFirstCnab240SegmentLine,
  filterValidatableLines, createFieldsFromLines, getFieldRange
} from '@test/test-utils'


describe('Cnab240BoletoEnderecoField', (): void => {
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

        const FieldClass = Cnab240BoletoEnderecoField()
        const field = new FieldClass(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it.each([
      { FieldClass: Cnab240BancoDoBrasilBoletoEnderecoField, examplePath: 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', expectedFirstValue: 'RUA DAS FLORES 100 APTO 12' },
      { FieldClass: Cnab240BoletoEnderecoField(), examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt', expectedFirstValue: 'RUA EXEMPLO 123' },
      { FieldClass: Cnab240BoletoEnderecoField(), examplePath: 'caixa/cnab240/caixa_cnab_240.txt', expectedFirstValue: 'RUA DAS FLORES 100 APTO 12' },
      { FieldClass: Cnab240BoletoEnderecoField(), examplePath: 'itau/cnab240/itau_cnab_240.txt', expectedFirstValue: 'RUA EXEMPLO, 100' },
      { FieldClass: Cnab240BoletoEnderecoField(), examplePath: 'santander/cnab240/santander_cnab_240.txt', expectedFirstValue: 'RUA DAS FLORES 100 APTO 12' },
      { FieldClass: Cnab240BoletoEnderecoField(), examplePath: 'sicoob/cnab240/sicoob_cnab_240.txt', expectedFirstValue: 'RUA DAS FLORES 100 APTO 12' },
      { FieldClass: Cnab240BoletoEnderecoField(), examplePath: 'sicredi/cnab240/sicredi_cnab_240.txt', expectedFirstValue: 'RUA DAS FLORES 100 APTO 12' }
    ])(
      'given segment Q lines with valid address ($examplePath) when reading value and validating then accepts all lines',
      ({ FieldClass, examplePath, expectedFirstValue }: {
        FieldClass: new (rawLine: string, lineNumber: number) => CnabField<string>
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
        const results = fields.map((field: CnabField<string>) => field.validate())

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
    const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

    it('given segment Q line with blank address when validating then returns null value and field error', (): void => {
      // Given
      const FieldClass = Cnab240BoletoEnderecoField()
      const fieldRange = getFieldRange(FieldClass)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        assert.fail('Linha segmento Q não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new FieldClass(invalidLine, lineNumber)
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

  describe('validate as optional field (Banco do Brasil)', (): void => {
    const examplePath = 'banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt'

    it('given segment Q line with blank address when validating then returns null value and no error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab240BancoDoBrasilBoletoEnderecoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab240SegmentLine(lines, 'Q')

      if (rawLine == null) {
        assert.fail('Linha segmento Q não encontrada')
      }

      const lineNumber = realLineNumber(lines, rawLine)
      const blankLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab240BancoDoBrasilBoletoEnderecoField(blankLine, lineNumber)
      const result = field.validate()

      // Then
      expect(blankLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result).toEqual(genValidCnabValidationResult())
    })
  })
})
