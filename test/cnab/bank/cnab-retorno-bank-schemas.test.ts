import { describe, it, expect } from '@jest/globals'
import { CNAB_RETORNO_BANK_SCHEMAS } from '@cnab/bank/cnab-retorno-bank-schemas'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabFixedContent, CnabLineSchema } from '@cnab/type/cnab-line-schema'
import { writeAtRange } from '@cnab/utils/line-writer'
import { cnab400RetornoLine } from '@test/test-utils'

function writeFixedContent(lineSchema: CnabLineSchema): string {
  const line = Array.from(cnab400RetornoLine(''))
  for (const { range, value } of lineSchema.fixedContent) {
    writeAtRange(line, range, value)
  }
  return line.join('')
}

describe('cnab-retorno-bank-schemas', (): void => {
  describe.each([
    CnabBank.BANCODOBRASIL,
    CnabBank.BRADESCO,
    CnabBank.CAIXA,
    CnabBank.ITAU,
    CnabBank.SANTANDER,
    CnabBank.SICOOB,
    CnabBank.SICREDI
  ])('given the CNAB 400 retorno schema of %s', (bank: CnabBank): void => {
    const schema = CNAB_RETORNO_BANK_SCHEMAS[bank][CnabFormat.CNAB400]

    it('when reading its fixed content then each value fills its whole range', (): void => {
      // Given
      const fixedContent = [...schema.header.fixedContent, ...schema.trailer.fixedContent]

      // When
      const mismatched = fixedContent.filter(({ range, value }: CnabFixedContent): boolean => value.length != range[1] - range[0] + 1)

      // Then
      expect(fixedContent.length).toBeGreaterThan(0)
      expect(mismatched).toEqual([])
    })

    it('when writing only its fixed content then the file is recognized as a retorno of the bank and the lines pass the line validators', (): void => {
      // Given
      const header = writeFixedContent(schema.header)
      const trailer = writeFixedContent(schema.trailer)

      // When
      const cnabFile = CnabFile.fromLines([header, cnab400RetornoLine('1'), trailer])
      const headerResult = schema.header.validate([header], false, 0, [])
      const trailerResult = schema.trailer.validate([trailer], false, 2, [])

      // Then
      expect(cnabFile.bank).toBe(bank)
      expect(cnabFile.format).toBe(CnabFormat.CNAB400)
      expect(cnabFile.fileType).toBe(CnabFileType.RETORNO)
      expect(headerResult).toEqual({ isValid: true, errors: [] })
      expect(trailerResult).toEqual({ isValid: true, errors: [] })
    })
  })
})
