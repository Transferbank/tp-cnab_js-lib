import * as path from 'path'
import { resPath } from '@test/conftest'
import { describe, it, expect } from '@jest/globals'
import * as TestUtils from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BradescoBoletoMultaCodigoField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-multa-codigo-field'

describe('Cnab240BradescoBoletoMultaCodigoField', (): void => {
  const examplePath = path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt')

  describe('shouldValidate', (): void => {
    describe.each([
      { segment: 'P', expectedShouldValidate: false },
      { segment: 'Q', expectedShouldValidate: false },
      { segment: 'R', expectedShouldValidate: true },
      { segment: 'S', expectedShouldValidate: false }
    ])('casos parametrizados', ({ segment, expectedShouldValidate }): void => {
      it(`dado segmento ${segment} quando verificar shouldValidate então retorna ${expectedShouldValidate}`, (): void => {
        // Given
        const lines = TestUtils.readExampleLines(examplePath)
        const rawLine = TestUtils.findFirstCnab240SegmentLine(lines, segment)!

        // When
        const shouldValidate = Cnab240BradescoBoletoMultaCodigoField.shouldValidate(rawLine)

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse e validate', (): void => {
    it('dado linhas segmento R com codigo multa válido quando parsear e validar então aceita todas as linhas', (): void => {
      // Given
      const lines = TestUtils.readExampleLines(examplePath)
      const validatableLines = TestUtils.filterValidatableLines(lines, Cnab240BradescoBoletoMultaCodigoField)
      
      const fields = validatableLines.map(({ rawLine, lineNumber }: { rawLine: string; lineNumber: number }) => 
        new Cnab240BradescoBoletoMultaCodigoField({ rawLine, lineNumber })
      )
      const results = fields.map((field: Cnab240BradescoBoletoMultaCodigoField) => field.validate())

      // Then
      expect(validatableLines.length).toBeGreaterThan(0)
      expect(fields[0].parse()).toBe('percentual')
      expect(fields[0].value).toBe('percentual')
      
      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })

    describe.each([
      { codigo: '0', expectedParse: 'dispensado' },
      { codigo: '1', expectedParse: 'valor' },
      { codigo: '2', expectedParse: 'percentual' }
    ])('casos parametrizados de códigos válidos', ({ codigo, expectedParse }): void => {
      it(`dado codigo multa ${codigo} quando parsear então retorna ${expectedParse}`, (): void => {
        // Given
        const lines = TestUtils.readExampleLines(examplePath)
        const rawLine = TestUtils.findFirstCnab240SegmentLine(lines, 'R')!
        const fieldRange = TestUtils.getFieldRange(Cnab240BradescoBoletoMultaCodigoField)
        const modifiedLine = TestUtils.replaceLineRange(rawLine, fieldRange, codigo)

        // When
        const field = new Cnab240BradescoBoletoMultaCodigoField({
          rawLine: modifiedLine,
          lineNumber: 1
        })

        // Then
        expect(field.parse()).toBe(expectedParse)
        expect(field.value).toBe(expectedParse)
        expect(field.validate()).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate com erro', (): void => {
    it('dado linha segmento R com codigo multa inválido quando validar então retorna erro de campo', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = TestUtils.getFieldRange(Cnab240BradescoBoletoMultaCodigoField)
      
      const lines = TestUtils.readExampleLines(examplePath)
      const rawLine = TestUtils.findFirstCnab240SegmentLine(lines, 'R')!

      const invalidLine = TestUtils.replaceLineRange(rawLine, fieldRange, '9')
      
      const expectedError = new CnabGenericFieldError({
        message: "Código de multa inválido: esperado '0', '1' ou '2', recebido '9'",
        lineNumber: dummyLineNumber,
        fieldName: 'codigo multa',
        range: fieldRange
      })

      // When
      const field = new Cnab240BradescoBoletoMultaCodigoField({
        rawLine: invalidLine,
        lineNumber: dummyLineNumber
      })
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
