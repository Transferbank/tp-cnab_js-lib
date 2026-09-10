import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError, CnabFieldEmptyValueError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BradescoBoletoNameField } from '@cnab/bank/bradesco/cnab/cnab400/field/cnab400-bradesco-boleto-name-field'

describe('Cnab400BradescoBoletoNameField', (): void => {
  const examplePath = 'bradesco/cnab400/bradesco_cnab_400.txt'

  describe('shouldValidate', (): void => {
    describe.each([
      { recordType: '0', expectedShouldValidate: false },
      { recordType: '1', expectedShouldValidate: true },
      { recordType: '2', expectedShouldValidate: false },
      { recordType: '9', expectedShouldValidate: false }
    ])('parameterized cases', ({ recordType, expectedShouldValidate }): void => {
      it(`given record type ${recordType} when checking shouldValidate then returns ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = lines.find((line: string) => line.startsWith(recordType))

        if (!rawLine) {
          throw new Error(`Linha com tipo de registro ${recordType} não encontrada`)
        }

        const field = new Cnab400BradescoBoletoNameField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('validate', (): void => {
    it('given boleto lines with valid name when validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const boletoLines = lines
        .map((line: string, lineNumber: number) => ({ rawLine: line, lineNumber }))
        .filter(({ rawLine }: { rawLine: string }) => {
          const field = new Cnab400BradescoBoletoNameField(rawLine, 1)
          return field.shouldValidate()
        })

      // When
      const results = boletoLines.map(({ rawLine, lineNumber }: { rawLine: string; lineNumber: number }) =>
        new Cnab400BradescoBoletoNameField(rawLine, lineNumber).validate()
      )

      // Then
      expect(boletoLines.length).toBeGreaterThan(0)
      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('parse', (): void => {
    it('given reference boleto line when parsing name then returns valid name', (): void => {
      // Given
      const dummyLineNumber = 37
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = lines.find((line: string) => {
        const field = new Cnab400BradescoBoletoNameField(line, 1)
        return field.shouldValidate()
      })

      if (!rawLine) {
        throw new Error('Linha de boleto não encontrada')
      }

      // When
      const field = new Cnab400BradescoBoletoNameField(rawLine, dummyLineNumber)

      // Then
      expect(field.parse()).toBe('COMERCIAL ALFA LTDA')
      expect(field.value).toBe('COMERCIAL ALFA LTDA')
    })
  })

  describe('validate with error', (): void => {
    it('given boleto line with blank name when validating then returns field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = new Cnab400BradescoBoletoNameField('', 0).range

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = lines.find((line: string) => {
        const field = new Cnab400BradescoBoletoNameField(line, 1)
        return field.shouldValidate()
      })

      if (!rawLine) {
        throw new Error('Linha de boleto não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      const expectedError = new CnabFieldMinLengthError({
        lineNumber: dummyLineNumber,
        fieldName: 'nome do sacado',
        range: fieldRange,
        minLength: 3
      })

      // When
      const field = new Cnab400BradescoBoletoNameField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.parse()).toThrow(CnabFieldEmptyValueError)
      expect(field.value).toBe(null)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabFieldMinLengthError)
      expect(result.errors[0].message).toBe(expectedError.message)
      expect(result.errors[0].lineNumber).toBe(expectedError.lineNumber)
    })
  })
})
