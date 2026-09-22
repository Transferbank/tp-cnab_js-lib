import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import {
  assertDefined,
  readExampleLines,
  replaceLineRange,
  resPath,
  findFirstCnab400RecordLine,
  filterValidatableLines,
  createFieldsFromLines,
  getFieldRange
} from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabFieldMinLengthError } from '@cnab/type/cnab-validation-error'
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
        const rawLine = findFirstCnab400RecordLine(lines, recordType)

        assertDefined(rawLine)

        const field = new Cnab400BradescoBoletoNameField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it('given boleto lines with valid name when reading value and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab400BradescoBoletoNameField),
        Cnab400BradescoBoletoNameField
      )

      const results = fields.map((field: Cnab400BradescoBoletoNameField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].value).toBe('COMERCIAL ALFA LTDA')

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })
  })

  describe('validate with error', (): void => {
    it('given boleto line with blank name when validating then returns field error', (): void => {
      // Given
      const dummyLineNumber = 37
      const fieldRange = getFieldRange(Cnab400BradescoBoletoNameField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      assertDefined(rawLine)

      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      // When
      const field = new Cnab400BradescoBoletoNameField(invalidLine, dummyLineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBe(null)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabFieldMinLengthError)
    })
  })
})
