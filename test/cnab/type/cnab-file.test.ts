import { describe, it, expect } from '@jest/globals'
import * as fs from 'fs'
import * as path from 'path'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabGenericFieldError, CnabInvalidLineSizeError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab240BradescoBoletoDataEmissaoField } from '@cnab/bank/bradesco/cnab/cnab240/field/cnab240-bradesco-boleto-data-emissao-field'
import { Cnab240LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CnabOptionalExtraFieldStub } from '@test/cnab/doubles/cnab-optional-extra-field-stub'
import { readExampleLines, replaceLineRange, resPath } from '@test/test-utils'

function createFileFromPath(filePath: string): File {
  const buffer = fs.readFileSync(filePath)
  const blob = new Blob([buffer])
  return new File([blob], path.basename(filePath))
}

describe('cnab-file', (): void => {
  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt', 'bradesco', '240', 16],
    ['bradesco/cnab400/bradesco_cnab_400.txt', 'bradesco', '400', 76]
  ])(
    'given document file when opening then detects bank, format and lines',
    async (
      examplePath: string,
      expectedBank: string,
      expectedFormat: string,
      expectedLineCount: number
    ): Promise<void> => {
      // Given
      const fullPath = path.join(resPath(), examplePath)
      const file = createFileFromPath(fullPath)

      // When
      const cnabFile = await CnabFile.open(file)

      // Then
      expect(cnabFile.bank).toBe(expectedBank)
      expect(cnabFile.format).toBe(expectedFormat)
      expect(cnabFile.rawLines.length).toBe(expectedLineCount)
      expect(cnabFile.schema).not.toBeNull()
    }
  )

  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt'],
    ['bradesco/cnab400/bradesco_cnab_400.txt']
  ])(
    'given valid document file when validating then reports no errors',
    async (examplePath: string): Promise<void> => {
      // Given
      const fullPath = path.join(resPath(), examplePath)
      const file = createFileFromPath(fullPath)
      const cnabFile = await CnabFile.open(file)
      const expectedResult = genValidCnabValidationResult()

      // When
      const result = cnabFile.validate(true)

      // Then
      expect(result).toEqual(expectedResult)
    }
  )

  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt', 5, 240],
    ['bradesco/cnab400/bradesco_cnab_400.txt', 2, 400]
  ])(
    'given document file with truncated line when validating then reports line size error',
    (examplePath: string, truncatedLineNumber: number, expectedSize: number): void => {
      // Given
      const truncatedSize = 5
      const fullPath = path.join(resPath(), examplePath)
      const rawLines = readExampleLines(fullPath)
      rawLines[truncatedLineNumber] = rawLines[truncatedLineNumber].substring(0, truncatedSize)

      const cnabFile = CnabFile.fromLines(rawLines)
      const expectedErrors = [
        new CnabInvalidLineSizeError({
          lineNumber: truncatedLineNumber,
          expectedSize,
          actualSize: truncatedSize
        })
      ]

      // When
      const result = cnabFile.validate(true)

      // Then
      expect(result.isValid).toBe(false)
      expect(result.errors).toEqual(expectedErrors)
    }
  )

  describe('optional fields', (): void => {
    const examplePath = 'bradesco/cnab240/bradesco_cnab_240.txt'

    describe.each([
      {
        description: 'a field registered directly in the schema',
        fieldName: 'data de emissão do título',
        fieldRange: new Cnab240BradescoBoletoDataEmissaoField('', 0).range,
        malformedValue: 'ABCDEFGH',
        extraFields: undefined
      },
      {
        description: 'a field passed via extraFields',
        fieldName: 'campo extra de teste',
        fieldRange: new CnabOptionalExtraFieldStub('', 0).range,
        malformedValue: 'ABCDEF',
        extraFields: [CnabOptionalExtraFieldStub]
      }
    ])('given $description', ({ fieldName, fieldRange, malformedValue, extraFields }): void => {
      it('given a blank value when validating then reports no errors', (): void => {
        // Given
        const fullPath = path.join(resPath(), examplePath)
        const rawLines = readExampleLines(fullPath)
        const segmentPLineNumber = rawLines.findIndex((line: string) => Cnab240LineTypeChecker.isSegmentoP(line))
        rawLines[segmentPLineNumber] = replaceLineRange(rawLines[segmentPLineNumber], fieldRange, '')

        const cnabFile = CnabFile.fromLines(rawLines)

        // When
        const result = cnabFile.validate(true, extraFields)

        // Then
        expect(result).toEqual(genValidCnabValidationResult())
      })

      it('given a malformed value when validating then reports a field error', (): void => {
        // Given
        const fullPath = path.join(resPath(), examplePath)
        const rawLines = readExampleLines(fullPath)
        const segmentPLineNumber = rawLines.findIndex((line: string) => Cnab240LineTypeChecker.isSegmentoP(line))
        rawLines[segmentPLineNumber] = replaceLineRange(rawLines[segmentPLineNumber], fieldRange, malformedValue)

        const cnabFile = CnabFile.fromLines(rawLines)
        const expectedErrors = [
          new CnabGenericFieldError({
            message: `Campo ${fieldName} com formato inválido: ${malformedValue}`,
            lineNumber: segmentPLineNumber,
            fieldName,
            range: fieldRange
          })
        ]

        // When
        const result = cnabFile.validate(true, extraFields)

        // Then
        expect(result.isValid).toBe(false)
        expect(result.errors).toEqual(expectedErrors)
      })
    })

    it('given document file with a malformed extra field when validating without passing extraFields then does not validate the extra field', (): void => {
      // Given
      const fieldRange = new CnabOptionalExtraFieldStub('', 0).range
      const fullPath = path.join(resPath(), examplePath)
      const rawLines = readExampleLines(fullPath)
      const segmentPLineNumber = rawLines.findIndex((line: string) => Cnab240LineTypeChecker.isSegmentoP(line))
      rawLines[segmentPLineNumber] = replaceLineRange(rawLines[segmentPLineNumber], fieldRange, 'ABCDEF')

      const cnabFile = CnabFile.fromLines(rawLines)

      // When
      const result = cnabFile.validate(true)

      // Then
      expect(result).toEqual(genValidCnabValidationResult())
    })
  })
})
