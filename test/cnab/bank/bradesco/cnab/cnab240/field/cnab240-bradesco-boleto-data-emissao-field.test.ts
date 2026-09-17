import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, replaceLineRange, resPath } from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldInvalidDateError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BradescoBoletoDataEmissaoField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-data-emissao-field'

describe('Cnab240BradescoBoletoDataEmissaoField', (): void => {
  const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

  describe('shouldValidate', (): void => {
    describe.each([
      { segment: 'P', expectedShouldValidate: true },
      { segment: 'Q', expectedShouldValidate: false },
      { segment: 'R', expectedShouldValidate: false },
      { segment: 'S', expectedShouldValidate: false }
    ])('parameterized cases', ({ segment, expectedShouldValidate }): void => {
      it(`given segment ${segment} when checking shouldValidate then returns ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = lines.find(
          (line: string) => line[7] === '3' && line[13] === segment
        )

        if (rawLine == null) {
          throw new Error(`Linha com segmento ${segment} não encontrada`)
        }

        const field = new Cnab240BradescoBoletoDataEmissaoField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it('given segment P lines with valid emission date when reading value and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const segmentPLines = lines
        .map((line: string, lineNumber: number) => ({ rawLine: line, lineNumber }))
        .filter(({ rawLine }: { rawLine: string }) => {
          const field = new Cnab240BradescoBoletoDataEmissaoField(rawLine, 1)
          return field.shouldValidate()
        })

      const fields = segmentPLines.map(({ rawLine, lineNumber }: { rawLine: string; lineNumber: number }) =>
        new Cnab240BradescoBoletoDataEmissaoField(rawLine, lineNumber)
      )

      const results = fields.map((field: Cnab240BradescoBoletoDataEmissaoField) => field.validate())

      // Then
      expect(segmentPLines.length).toBeGreaterThan(0)
      expect(fields[0].value).toEqual(new Date(2026, 11, 1))

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate as optional', (): void => {
    it('given segment P line with blank emission date when validating then accepts it as optional', (): void => {
      // Given
      const fieldRange = new Cnab240BradescoBoletoDataEmissaoField('', 0).range

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = lines.find(
        (line: string) => line[7] === '3' && line[13] === 'P'
      )

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const blankLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab240BradescoBoletoDataEmissaoField(blankLine, 37)
      const result = field.validate()

      // Then
      expect(blankLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result).toEqual(genValidCnabValidationResult())
    })

    it('given segment P line with malformed emission date when validating then does not silently accept it as blank', (): void => {
      // Given
      const fieldRange = new Cnab240BradescoBoletoDataEmissaoField('', 0).range

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = lines.find(
        (line: string) => line[7] === '3' && line[13] === 'P'
      )

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGH')

      // When / Then
      const field = new Cnab240BradescoBoletoDataEmissaoField(invalidLine, 37)
      expect(invalidLine.length).toBe(rawLine.length)

      // Campo opcional significa "pode estar em branco", nao "pode conter lixo":
      // conteudo presente porem malformado deve reportar erro, mesmo sendo opcional.
      expect(() => field.value).toThrow(CnabFieldInvalidDateError)
      expect(field.validate().isValid).toBe(false)
    })

    it('given segment P line with a calendar date that does not exist when validating then does not silently roll it over', (): void => {
      // Given
      const fieldRange = new Cnab240BradescoBoletoDataEmissaoField('', 0).range

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = lines.find(
        (line: string) => line[7] === '3' && line[13] === 'P'
      )

      if (rawLine == null) {
        throw new Error('Linha segmento P não encontrada')
      }

      // 31/02/2026 nao existe - new Date(2026, 1, 31) faria rollover pra 03/03/2026
      const invalidLine = replaceLineRange(rawLine, fieldRange, '31022026')

      // When / Then
      const field = new Cnab240BradescoBoletoDataEmissaoField(invalidLine, 37)
      expect(invalidLine.length).toBe(rawLine.length)

      expect(() => field.value).toThrow(CnabFieldInvalidDateError)
      expect(field.validate().isValid).toBe(false)
    })
  })
})
