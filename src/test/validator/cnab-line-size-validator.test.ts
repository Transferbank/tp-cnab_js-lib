import * as path from 'path'
import { CnabValidationErrorType } from '@cnab/type/cnab-validation-error'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { Cnab240LineSizeValidator, Cnab400LineSizeValidator } from '@cnab/validators/cnab-line-size-validator'
import { readExampleLines } from '@test/test-utils'
import { resPath } from '@test/conftest'

describe('CnabLineSizeValidator', () => {
  describe.each([
    {
      validatorType: Cnab240LineSizeValidator,
      examplePath: 'bradesco/cnab240/bradesco_cnab_240.txt'
    },
    {
      validatorType: Cnab400LineSizeValidator,
      examplePath: 'bradesco/cnab400/bradesco_cnab_400.txt'
    }
  ])('$validatorType.name', ({ validatorType, examplePath }) => {
    it('given valid doc lines when validating size then accepts all lines', () => {
      // Given
      const rawLines = readExampleLines(path.join(resPath(), examplePath))
      const expectedSize = validatorType.expectedSize
      const expectedResults: CnabValidationResult[] = rawLines.map(() => ({
        isValid: true,
        errors: []
      }))

      // When
      const results = rawLines.map((rawLine: string, lineNumber: number) =>
        new validatorType({ rawLine, lineNumber }).validate()
      )

      // Then
      const lineSizes = new Set(rawLines.map((line: string) => line.length))
      expect(lineSizes).toEqual(new Set([expectedSize]))
      expect(results).toEqual(expectedResults)
    })
  })

  describe.each([
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
  ])('$validatorType.name - invalid size', ({ validatorType, examplePath, transform, sizeDelta }) => {
    it('given wrong line size when validating then returns line error', () => {
      // Given
      const rawLine = readExampleLines(path.join(resPath(), examplePath))[0]
      const expectedSize = validatorType.expectedSize
      const invalidLine = transform(rawLine)
      const actualSize = expectedSize + sizeDelta
      const dummyLineNumber = 37
      const expectedResult: CnabValidationResult = {
        isValid: false,
        errors: [{
          message: `Tamanho de linha inválido: esperado ${expectedSize}, recebido ${actualSize}`,
          errorType: CnabValidationErrorType.LINE,
          lineNumber: dummyLineNumber
        }]
      }

      // When
      const result = new validatorType({
        rawLine: invalidLine,
        lineNumber: dummyLineNumber
      }).validate()

      // Then
      expect(invalidLine.length).toBe(actualSize)
      expect(result).toEqual(expectedResult)
    })
  })
})
