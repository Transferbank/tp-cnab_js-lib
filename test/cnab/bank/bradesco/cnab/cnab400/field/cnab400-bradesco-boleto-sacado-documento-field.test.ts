import * as path from 'path'
import { resPath } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import {
  assertDefined,
  readExampleLines,
  replaceLineRange,
  realLineNumber,
  findFirstCnab400RecordLine,
  filterValidatableLines,
  createFieldsFromLines,
  getFieldRange
} from '@test/test-utils'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import { genValidCnabValidationResult } from '@test/cnab/doubles/cnab-validation-result-stub'
import { Cnab400BradescoBoletoSacadoDocumentoField } from '@cnab/bank/bradesco/cnab/cnab400/field/cnab400-bradesco-boleto-sacado-documento-field'

describe('Cnab400BradescoBoletoSacadoDocumentoField', (): void => {
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

        assertDefined(rawLine, `Linha com tipo de registro ${recordType} não encontrada`)

        const field = new Cnab400BradescoBoletoSacadoDocumentoField(rawLine, 1)

        // When
        const shouldValidate = field.shouldValidate()

        // Then
        expect(shouldValidate).toBe(expectedShouldValidate)
      })
    })
  })

  describe('value and validate', (): void => {
    it('given detail lines with valid document when reading value and validating then accepts all lines', (): void => {
      // Given
      const lines = readExampleLines(path.join(resPath(), examplePath))
      const fields = createFieldsFromLines(
        filterValidatableLines(lines, Cnab400BradescoBoletoSacadoDocumentoField),
        Cnab400BradescoBoletoSacadoDocumentoField
      )

      const results = fields.map((field: Cnab400BradescoBoletoSacadoDocumentoField) => field.validate())

      // Then
      expect(fields.length).toBeGreaterThan(0)
      expect(fields[0].value).toBe('20000000997330')

      results.forEach((result: CnabValidationResult) => {
        expect(result).toEqual(genValidCnabValidationResult())
      })
    })

    it('given detail line with a zero-padded CPF when validating then accepts it', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400BradescoBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      assertDefined(rawLine, 'Linha detalhe não encontrada')

      const lineNumber = realLineNumber(lines, rawLine)

      // CPF 123.456.789-09 gravado à direita num campo de 14 posições, com o
      // indicador de tipo de inscrição (posições 219-220) marcado como "01"
      const lineWithCpfIndicator = replaceLineRange(rawLine, [219, 220], '01')
      const lineWithCpf = replaceLineRange(lineWithCpfIndicator, fieldRange, '00012345678909')

      // When
      const field = new Cnab400BradescoBoletoSacadoDocumentoField(lineWithCpf, lineNumber)
      const result = field.validate()

      // Then
      expect(field.value).toBe('00012345678909')
      expect(result).toEqual(genValidCnabValidationResult())
    })

    it('given detail line indicating CNPJ whose last 11 digits form a valid CPF when validating then rejects it', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400BradescoBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      assertDefined(rawLine, 'Linha detalhe não encontrada')

      const lineNumber = realLineNumber(lines, rawLine)

      // Indicador "02" (CNPJ), mas o valor so forma um CNPJ valido se
      // adivinhado como CPF pelos ultimos 11 digitos
      const lineWithCnpjIndicator = replaceLineRange(rawLine, [219, 220], '02')
      const lineWithAmbiguousDocument = replaceLineRange(lineWithCnpjIndicator, fieldRange, '99912345678909')

      // When
      const field = new Cnab400BradescoBoletoSacadoDocumentoField(lineWithAmbiguousDocument, lineNumber)
      const result = field.validate()

      // Then
      expect(result.isValid).toBe(false)
    })
  })

  describe('validate with error', (): void => {
    it('given detail line with blank document when validating then returns null value and field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400BradescoBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      assertDefined(rawLine, 'Linha detalhe não encontrada')

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo documento do sacado inválido: deve ser CPF ou CNPJ válido',
        lineNumber,
        fieldName: 'documento do sacado',
        range: fieldRange
      })

      // When
      const field = new Cnab400BradescoBoletoSacadoDocumentoField(invalidLine, lineNumber)
      const result = field.validate()

      // Then
      expect(invalidLine.length).toBe(rawLine.length)
      expect(field.value).toBeNull()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CnabGenericFieldError)
      expect(result.errors[0].message).toBe(expectedError.message)
      expect(result.errors[0].lineNumber).toBe(expectedError.lineNumber)
    })

    it('given detail line with invalid document when validating then returns field error', (): void => {
      // Given
      const fieldRange = getFieldRange(Cnab400BradescoBoletoSacadoDocumentoField)

      const lines = readExampleLines(path.join(resPath(), examplePath))
      const rawLine = findFirstCnab400RecordLine(lines, '1')

      assertDefined(rawLine, 'Linha detalhe não encontrada')

      const lineNumber = realLineNumber(lines, rawLine)
      const invalidLine = replaceLineRange(rawLine, fieldRange, '00000000000000')

      const expectedError = new CnabGenericFieldError({
        message: 'Campo documento do sacado inválido: deve ser CPF ou CNPJ válido',
        lineNumber,
        fieldName: 'documento do sacado',
        range: fieldRange
      })

      // When
      const field = new Cnab400BradescoBoletoSacadoDocumentoField(invalidLine, lineNumber)
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
