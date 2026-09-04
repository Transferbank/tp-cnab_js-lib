import * as path from 'path'
import { readExampleLines, resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import {
  Cnab240LineSizeValidator,
  Cnab400LineSizeValidator,
  CnabLineSizeValidator
} from '@cnab/validators/cnab-line-size-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabInvalidLineSizeError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'

type ValidatorConstructor = new (rawLine: string, lineNumber: number) => CnabLineSizeValidator

interface TestCase {
  validatorType: ValidatorConstructor
  examplePath: string
  expectedSize: number
}

const testCases: TestCase[] = [
  {
    validatorType: Cnab240LineSizeValidator,
    examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt',
    expectedSize: 240
  },
  {
    validatorType: Cnab400LineSizeValidator,
    examplePath: 'bradesco/cnab400/bradesco_cnab_400.txt',
    expectedSize: 400
  }
]

describe('CnabLineSizeValidator', (): void => {
  testCases.forEach(({ validatorType, examplePath, expectedSize }): void => {
    const validatorName = validatorType.name

    describe(`${validatorName} - Valid Lines`, (): void => {
      it('given valid document lines when validating size then accepts all lines', (): void => {
        // Given
        const rawLines = readExampleLines(path.join(resPath(), examplePath))
        const expectedResults = rawLines.map(() => genValidCnabValidationResult())

        // When
        const results = rawLines.map((rawLine: string, index: number) => {
          const validator = new validatorType(rawLine, index)
          return validator.validate()
        })

        // Then
        const lineSizes = new Set(rawLines.map((line: string) => line.length))
        expect(lineSizes).toEqual(new Set([expectedSize]))
        expect(results).toEqual(expectedResults)
      })
    })

    describe(`${validatorName} - Invalid Lines`, (): void => {
      it('given line with smaller size when validating then returns error', (): void => {
        // Given
        const rawLines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = rawLines[0]
        const invalidLine = rawLine.slice(0, -1)
        const actualSize = expectedSize - 1
        const dummyLineNumber = 37
        const expectedResult: CnabValidationResult = {
          isValid: false,
          errors: [
            new CnabInvalidLineSizeError({
              lineNumber: dummyLineNumber,
              expectedSize,
              actualSize
            })
          ]
        }

        // When
        const validator = new validatorType(invalidLine, dummyLineNumber)
        const result = validator.validate()

        // Then
        expect(invalidLine.length).toBe(actualSize)
        expect(result).toEqual(expectedResult)
      })

      it('given line with larger size when validating then returns error', (): void => {
        // Given
        const rawLines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = rawLines[0]
        const invalidLine = `${rawLine} `
        const actualSize = expectedSize + 1
        const dummyLineNumber = 42
        const expectedResult: CnabValidationResult = {
          isValid: false,
          errors: [
            new CnabInvalidLineSizeError({
              lineNumber: dummyLineNumber,
              expectedSize,
              actualSize
            })
          ]
        }

        // When
        const validator = new validatorType(invalidLine, dummyLineNumber)
        const result = validator.validate()

        // Then
        expect(invalidLine.length).toBe(actualSize)
        expect(result).toEqual(expectedResult)
      })
    })
  })
})
