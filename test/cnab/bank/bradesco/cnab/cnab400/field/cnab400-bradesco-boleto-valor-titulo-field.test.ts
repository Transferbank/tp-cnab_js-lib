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
import { CnabGenericFieldError, CnabFieldEmptyValueError, CnabFieldInvalidNumberError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BradescoBoletoValorTituloField } from '@cnab/bank/bradesco/cnab/cnab400/field/cnab400-bradesco-boleto-valor-titulo-field'

describe('Cnab400BradescoBoletoValorTituloField', (): void => {
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
        const rawLine = findFirstCnab400RecordLine(lines, recordType)

        if (rawLine == null) {
          throw new Error(`Linha com tipo de registro ${recordType} não encontrada`)
        }

        const field = new Cnab400BradescoBoletoValorTituloField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('parse and validate', (): void => {
    it('given detail lines with valid title value when parsing and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab400BradescoBoletoValorTituloField),
        Cnab400BradescoBoletoValorTituloField
      )

      const results = fields.map((field: Cnab400BradescoBoletoValorTituloField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].parse()).toBe(22560.93)
      expect(fields[0].value).toBe(22560.93)
      
      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate with error', (): void => {
    it('given detail line with blank value when validating then throws empty value error', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = getFieldRange(Cnab400BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab400BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.parse()).toThrow(CnabFieldEmptyValueError)
      expect(field.value).toBe(null)
    })

    it('given detail line with invalid alphanumeric value when validating then throws error', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = getFieldRange(Cnab400BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, 'ABCDEFGHIJKLM')

      // When / Then
      const field = new Cnab400BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
      expect(invalidLine.length).toBe(rawLine.length)
      expect(() => field.parse()).toThrow(CnabFieldInvalidNumberError)
    })

    it('given detail line with negative value when validating then returns field error', (): void => {
      // Given
      const dummyLineNumber = 42
      const fieldRange = getFieldRange(Cnab400BradescoBoletoValorTituloField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      if (rawLine == null) {
        throw new Error('Linha detalhe não encontrada')
      }

      const invalidLine = replaceLineRange(rawLine, fieldRange, '0000000000000')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo valor do título inválido: deve ser maior que zero',
        lineNumber: dummyLineNumber,
        fieldName: 'valor do título',
        range: fieldRange
      })

      // When
      const field = new Cnab400BradescoBoletoValorTituloField(invalidLine, dummyLineNumber)
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
