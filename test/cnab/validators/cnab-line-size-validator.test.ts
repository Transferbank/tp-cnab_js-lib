import * as path from 'path'
import { resPath } from '@test/conftest'
import { readExampleLines } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import {
  Cnab240LineSizeValidator,
  Cnab400LineSizeValidator,
  CnabLineSizeValidator
} from '@cnab/validators/cnab-line-size-validator'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'

type ValidatorConstructor = new (params: { rawLine: string; lineNumber: number }) => CnabLineSizeValidator

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
        expect(rawLines.length).toBeGreaterThan(0)

        // When
        const results = rawLines.map((rawLine: string, index: number) => {
          const validator = new validatorType({
            rawLine,
            lineNumber: index
          })
          return validator.validate()
        })

        // Then
        expect(results.every((result: CnabValidationResult) => result.isValid)).toBe(true)
        expect(results.every((result: CnabValidationResult) => result.errors.length === 0)).toBe(true)
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

        // When
        const validator = new validatorType({
          rawLine: invalidLine,
          lineNumber: dummyLineNumber
        })
        const result = validator.validate()

        // Then
        expect(invalidLine.length).toBe(actualSize)
        expect(result.isValid).toBe(false)
        expect(result.errors).toHaveLength(1)
        expect(result.errors[0].message).toBe(
          `Tamanho de linha inválido: esperado ${expectedSize}, recebido ${actualSize}`
        )
        expect(result.errors[0].lineNumber).toBe(dummyLineNumber)
      })

      it('given line with larger size when validating then returns error', (): void => {
        // Given
        const rawLines = readExampleLines(path.join(resPath(), examplePath))
        const rawLine = rawLines[0]
        const invalidLine = `${rawLine} `
        const actualSize = expectedSize + 1
        const dummyLineNumber = 42

        // When
        const validator = new validatorType({
          rawLine: invalidLine,
          lineNumber: dummyLineNumber
        })
        const result = validator.validate()

        // Then
        expect(invalidLine.length).toBe(actualSize)
        expect(result.isValid).toBe(false)
        expect(result.errors).toHaveLength(1)
        expect(result.errors[0].message).toBe(
          `Tamanho de linha inválido: esperado ${expectedSize}, recebido ${actualSize}`
        )
        expect(result.errors[0].lineNumber).toBe(dummyLineNumber)
      })
    })
  })
})
