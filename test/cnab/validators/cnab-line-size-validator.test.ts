import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { readExampleLines, resPath } from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabInvalidLineSizeError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240LineSizeValidator, Cnab400LineSizeValidator} from '@cnab/validators/cnab-line-size-validator'

describe('CnabLineSizeValidator', (): void => {
  it.each([
    { 
      validatorType: Cnab240LineSizeValidator, 
      examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt' 
    },
    { 
      validatorType: Cnab400LineSizeValidator, 
      examplePath: 'bradesco/cnab400/bradesco_cnab_400.txt' 
    }
  ])(
    'given valid doc lines ($validatorType.name) when validating size then accepts all lines',
    ({ validatorType, examplePath }): void => {
      // Given
      const expectedSize = validatorType.expectedSize
      const rawLines = readExampleLines(path.join(resPath(), examplePath))
      const expectedResults = rawLines.map(() => genValidCnabValidationResult())

      // When
      const results = rawLines.map((rawLine: string, lineNumber: number) =>
        new validatorType(rawLine, lineNumber).validate()
      )

      // Then
      expect(new Set(rawLines.map((line: string) => line.length))).toEqual(new Set([expectedSize]))
      expect(results).toEqual(expectedResults)
    }
  )

  it.each([
    {
      validatorType: Cnab240LineSizeValidator,
      examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt',
      transform: (line: string): string => line.slice(0, -1),
      sizeDelta: -1
    },
    {
      validatorType: Cnab400LineSizeValidator,
      examplePath: 'bradesco/cnab400/bradesco_cnab_400.txt',
      transform: (line: string): string => `${line} `,
      sizeDelta: 1
    }
  ])(
    'given wrong line size ($validatorType.name) when validating then returns line error',
    ({ validatorType, examplePath, transform, sizeDelta }): void => {
      // Given
      const expectedSize = validatorType.expectedSize
      const rawLine = readExampleLines(path.join(resPath(), examplePath))[0]
      const invalidLine = transform(rawLine)
      const actualSize = expectedSize + sizeDelta
      const dummyLineNumber = 37
      const expectedResult: CnabValidationResult = {
        isValid: false,
        errors: [
          new CnabInvalidLineSizeError({ lineNumber: dummyLineNumber, expectedSize, actualSize })
        ]
      }

      // When
      const result = new validatorType(invalidLine, dummyLineNumber).validate()

      // Then
      expect(invalidLine.length).toBe(actualSize)
      expect(result).toEqual(expectedResult)
    }
  )
})