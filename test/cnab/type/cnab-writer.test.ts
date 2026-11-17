import { describe, it, expect } from '@jest/globals'
import { Cnab, CnabBoleto } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabWriter } from '@cnab/type/cnab-writer'
import { CnabMinimumLinesNotReachedException, CnabWriteNotSupportedException } from '@cnab/exception/cnab-exception'

describe('CnabWriter', (): void => {
  describe.each([
    CnabBank.BANCODOBRASIL,
    CnabBank.BRADESCO,
    CnabBank.CAIXA,
    CnabBank.ITAU,
    CnabBank.SANTANDER,
    CnabBank.SICOOB,
    CnabBank.SICREDI
  ])('given a cnab with two boletos for %s', (bank: CnabBank): void => {
    it('when writing a CNAB 400 retorno then the file is read back as a retorno of the bank with the same boletos and numbered lines', (): void => {
      // Given
      const cnab = new Cnab({ boletos: [new CnabBoleto(), new CnabBoleto()] })

      // When
      const lines = CnabWriter.write(cnab, bank, CnabFormat.CNAB400, CnabFileType.RETORNO)
      const cnabFile = CnabFile.fromLines(lines)
      const sequenciais = lines.map((line: string): string => line.substring(394, 400))

      // Then
      expect(cnabFile.bank).toBe(bank)
      expect(cnabFile.format).toBe(CnabFormat.CNAB400)
      expect(cnabFile.fileType).toBe(CnabFileType.RETORNO)
      expect(cnabFile.boletoCount).toBe(2)
      expect(sequenciais).toEqual(['000001', '000002', '000003', '000004'])
    })
  })

  describe.each([
    { format: CnabFormat.CNAB240, fileType: CnabFileType.RETORNO },
    { format: CnabFormat.CNAB400, fileType: CnabFileType.REMESSA }
  ])('given the layout CNAB$format of $fileType', ({ format, fileType }): void => {
    it('when writing then throws a write not supported exception', (): void => {
      // Given
      const cnab = new Cnab({ boletos: [new CnabBoleto()] })

      // When
      const write = (): string[] => CnabWriter.write(cnab, CnabBank.BRADESCO, format, fileType)

      // Then
      expect(write).toThrow(CnabWriteNotSupportedException)
    })
  })

  it('given a cnab without boletos when writing then throws a minimum lines not reached exception', (): void => {
    // Given
    const cnab = new Cnab()

    // When
    const write = (): string[] => CnabWriter.write(cnab, CnabBank.BRADESCO, CnabFormat.CNAB400, CnabFileType.RETORNO)

    // Then
    expect(write).toThrow(CnabMinimumLinesNotReachedException)
  })
})
