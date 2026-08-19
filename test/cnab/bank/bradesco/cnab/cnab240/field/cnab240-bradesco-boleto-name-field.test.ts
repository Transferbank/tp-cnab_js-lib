import * as path from 'path'
import { resPath } from '@test/conftest'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, replaceLineRange } from '@test/test-utils'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab240BradescoBoletoNameField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-name-field'

describe('Cnab240BradescoBoletoNameField', (): void => {
  const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

  describe('shouldValidate', (): void => {
    describe.each([
      { segment: 'P', expectedShouldValidate: false },
      { segment: 'Q', expectedShouldValidate: true },
      { segment: 'R', expectedShouldValidate: false },
      { segment: 'S', expectedShouldValidate: false }
    ])('casos parametrizados', ({ segment, expectedShouldValidate }): void => {
      it(`dado segmento ${segment} quando verificar shouldValidate então retorna ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = lines.find(
          (line: string) => line[7] === '3' && line[13] === segment
        )

        if (!rawLine) {
          throw new Error(`Linha com segmento ${segment} não encontrada`)
        }

        // When
        const shouldValidate = new Cnab240BradescoBoletoNameField({
          rawLine,
          lineNumber: 0
        }).shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse e validate', (): void => {
    it('dado linhas segmento Q com nome válido quando parsear e validar então aceita todas as linhas', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const segmentQLines = lines
        .map((line: string, lineNumber: number) => ({ rawLine: line, lineNumber }))
        .filter(({ rawLine }: { rawLine: string }) => 
          new Cnab240BradescoBoletoNameField({ rawLine, lineNumber: 0 }).shouldValidate()
        )

      const fields = segmentQLines.map(({ rawLine, lineNumber }: { rawLine: string; lineNumber: number }) => 
        new Cnab240BradescoBoletoNameField({
          rawLine,
          lineNumber
        })
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

  describe('validate com erro', (): void => {
    it('dado linha segmento Q com nome em branco quando validar então retorna erro de campo', (): void => {
      // Given
      const dummyLineNumber = 37
      const expectedErrorMessage = 'Nome do sacado no boleto espera ao menos 3 caracteres'
      const fieldRange = new Cnab240BradescoBoletoNameField({ 
        rawLine: '', 
        lineNumber: 0 
      }).range
      
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = lines.find(
        (line: string) => 
          new Cnab240BradescoBoletoNameField({ rawLine: line, lineNumber: 0 }).shouldValidate()
      )

      if (!rawLine) {
        throw new Error('Linha segmento Q não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')
      
      const expectedResult: CnabValidationResult = {
        isValid: false,
        errors: [{
          message: expectedErrorMessage,
          errorType: CnabValidationErrorType.FIELD,
          lineNumber: dummyLineNumber,
          fieldName: 'nome do sacado',
          range: fieldRange
        }]
      }

      // When
      const field = new Cnab240BradescoBoletoNameField({
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
