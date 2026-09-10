import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError, CnabFieldEmptyValueError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BradescoBoletoNameField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-name-field'

describe('Cnab240BradescoBoletoNameField', (): void => {
  const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

  describe('shouldValidate', (): void => {
    describe.each([
      { segment: 'P', expectedShouldValidate: false },
      { segment: 'Q', expectedShouldValidate: true },
      { segment: 'R', expectedShouldValidate: false },
      { segment: 'S', expectedShouldValidate: false }
    ])('parameterized cases', ({ segment, expectedShouldValidate }): void => {
      it(`given segment ${segment} when checking shouldValidate then returns ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = lines.find(
          (line: string) => line[7] === '3' && line[13] === segment
        )

        if (!rawLine) {
          throw new Error(`Linha com segmento ${segment} não encontrada`)
        }

        const field = new Cnab240BradescoBoletoNameField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse and validate', (): void => {
    it('given segment Q lines with valid name when parsing and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const segmentQLines = lines
        .map((line: string, lineNumber: number) => ({ rawLine: line, lineNumber }))
        .filter(({ rawLine }: { rawLine: string }) => {
          const field = new Cnab240BradescoBoletoNameField(rawLine, 1)
          return field.shouldValidate()
        })

      const fields = segmentQLines.map(({ rawLine, lineNumber }: { rawLine: string; lineNumber: number }) => 
        new Cnab240BradescoBoletoNameField(rawLine, lineNumber)
      )

      const results = fields.map((field: Cnab240BradescoBoletoNameField) => field.validate())

      // Then
      expect(segmentQLines.length).toBeGreaterThan(0)
      expect(fields[0].parse()).toBe('JOAO EXEMPLO SILVA')
      expect(fields[0].value).toBe('JOAO EXEMPLO SILVA')
      
      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate with error', (): void => {
    it('given segment Q line with blank name when validating then returns field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = new Cnab240BradescoBoletoNameField('', 0).range
      
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = lines.find(
        (line: string) => {
          const field = new Cnab240BradescoBoletoNameField(line, 1)
          return field.shouldValidate()
        }
      )

      if (!rawLine) {
        throw new Error('Linha segmento Q não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')
      
      const expectedError = new CnabFieldMinLengthError({
        lineNumber: dummyLineNumber,
        fieldName: 'nome do sacado',
        range: fieldRange,
        minLength: 3
      })

      // When
      const field = new Cnab240BradescoBoletoNameField(invalidLine, dummyLineNumber)
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
