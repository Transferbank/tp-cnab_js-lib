import * as path from 'path'
import { resPath } from '@test/conftest'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, replaceLineRange } from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
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
    ])('casos parametrizados', ({ recordType, expectedShouldValidate }): void => {
      it(`dado tipo de registro ${recordType} quando verificar shouldValidate então retorna ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = lines.find((line: string) => line.startsWith(recordType))

        if (!rawLine) {
          throw new Error(`Linha com tipo de registro ${recordType} não encontrada`)
        }

        // When
        const shouldValidate = new Cnab400BradescoBoletoNameField({
          rawLine,
          lineNumber: 0
        }).shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('validate', (): void => {
    it('dado linhas de boleto com nome válido quando validar então aceita todas as linhas', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const boletoLines = lines
        .map((line: string, lineNumber: number) => ({ rawLine: line, lineNumber }))
        .filter(({ rawLine }: { rawLine: string }) =>
          new Cnab400BradescoBoletoNameField({ rawLine, lineNumber: 0 }).shouldValidate()
        )

      // When
      const results = boletoLines.map(({ rawLine, lineNumber }: { rawLine: string; lineNumber: number }) =>
        new Cnab400BradescoBoletoNameField({
          rawLine,
          lineNumber
        }).validate()
      )

      // Then
      expect(boletoLines.length).toBeGreaterThan(0)
      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('parse', (): void => {
    it('dado linha de boleto de referência quando parsear nome então retorna nome válido', (): void => {
      // Given
      const dummyLineNumber = 37
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = lines.find((line: string) =>
        new Cnab400BradescoBoletoNameField({ rawLine: line, lineNumber: 0 }).shouldValidate()
      )

      if (!rawLine) {
        throw new Error('Linha de boleto não encontrada')
      }

      // When
      const field = new Cnab400BradescoBoletoNameField({
        rawLine,
        lineNumber: dummyLineNumber
      })

      // Then
      expect(field.parse()).toBe('COMERCIAL ALFA LTDA')
      expect(field.value).toBe('COMERCIAL ALFA LTDA')
    })
  })

  describe('validate com erro', (): void => {
    it('dado linha de boleto com nome em branco quando validar então retorna erro de campo', (): void => {
      // Given
      const dummyLineNumber = 37
      const expectedErrorMessage = 'Nome do sacado no boleto espera ao menos 3 caracteres'
      const fieldRange = new Cnab400BradescoBoletoNameField({
        rawLine: '',
        lineNumber: 0
      }).range

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = lines.find((line: string) =>
        new Cnab400BradescoBoletoNameField({ rawLine: line, lineNumber: 0 }).shouldValidate()
      )

      if (!rawLine) {
        throw new Error('Linha de boleto não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      const expectedResult: CnabValidationResult = {
        isValid: false,
        errors: [
          {
            message: expectedErrorMessage,
            errorType: CnabValidationErrorType.FIELD,
            lineNumber: dummyLineNumber,
            fieldName: 'nome do sacado',
            range: fieldRange
          }
        ]
      }

      // When
      const field = new Cnab400BradescoBoletoNameField({
        rawLine: invalidLine,
        lineNumber: dummyLineNumber
      })
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.parse()).toBe('')
      expect(field.value).toBe(null)
      expect(result).toEqual(expectedResult)
    })
  })
})
