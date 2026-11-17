import { describe, it, expect } from '@jest/globals'
import { Cnab, CnabBoleto } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabWriter } from '@cnab/type/cnab-writer'
import { CnabGenericFieldError } from '@cnab/type/cnab-validation-error'
import {
  CnabInvalidFileException,
  CnabMinimumLinesNotReachedException,
  CnabWriteNotSupportedException
} from '@cnab/exception/cnab-exception'

function captureError(action: () => unknown): unknown {
  try {
    action()
  } catch (error) {
    return error
  }
  return null
}

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
      const cnab = new Cnab({
        boletos: [
          new CnabBoleto({ fields: { codigo_de_ocorrencia: '02' } }),
          new CnabBoleto({ fields: { codigo_de_ocorrencia: '06' } })
        ]
      })

      // When
      const lines = CnabWriter.write(cnab, bank, CnabFormat.CNAB400, CnabFileType.RETORNO)
      const cnabFile = CnabFile.fromLines(lines)
      const read = cnabFile.read()
      const sequenciais = lines.map((line: string): string => line.substring(394, 400))

      // Then
      expect(cnabFile.bank).toBe(bank)
      expect(cnabFile.format).toBe(CnabFormat.CNAB400)
      expect(cnabFile.fileType).toBe(CnabFileType.RETORNO)
      expect(cnabFile.boletoCount).toBe(2)
      expect(sequenciais).toEqual(['000001', '000002', '000003', '000004'])
      expect(read.boletos).toEqual(cnab.boletos)
    })
  })

  it('given boletos with values that cannot be written when writing then throws an invalid file exception with an error for each field', (): void => {
    // Given
    const cnab = new Cnab({
      boletos: [
        new CnabBoleto({ fields: { codigo_de_ocorrencia: '06' } }),
        new CnabBoleto({ fields: { codigo_de_ocorrencia: 'ABC' } }),
        new CnabBoleto({ fields: { codigo_de_ocorrencia: 6 } })
      ]
    })
    const expectedErrors = [
      new CnabGenericFieldError({
        message: 'Campo codigo_de_ocorrencia não pode ser escrito: valor "ABC" não cabe em 2 posições',
        lineNumber: 2,
        fieldKey: 'codigo_de_ocorrencia',
        range: [109, 110]
      }),
      new CnabGenericFieldError({
        message: 'Campo codigo_de_ocorrencia não pode ser escrito: valor 6 deve ser texto',
        lineNumber: 3,
        fieldKey: 'codigo_de_ocorrencia',
        range: [109, 110]
      })
    ]

    // When
    const error = captureError((): string[] => CnabWriter.write(cnab, CnabBank.BRADESCO, CnabFormat.CNAB400, CnabFileType.RETORNO))

    // Then
    expect(error).toBeInstanceOf(CnabInvalidFileException)
    expect(error).toHaveProperty('errors', expectedErrors)
  })

  it.each([
    ['without a code', {}],
    ['with a code the layout does not accept', { codigo_de_ocorrencia: '6#' }]
  ])('given a boleto %s when writing then throws an invalid file exception with the validation error of the field', (_: string, fields: Record<string, unknown>): void => {
    // Given
    const cnab = new Cnab({ boletos: [new CnabBoleto({ fields })] })
    const expectedErrors = [
      new CnabGenericFieldError({
        message: 'Campo código de ocorrência inválido: deve conter 2 letras maiúsculas ou dígitos',
        lineNumber: 1,
        fieldKey: 'codigo_de_ocorrencia',
        range: [109, 110]
      })
    ]

    // When
    const error = captureError((): string[] => CnabWriter.write(cnab, CnabBank.BRADESCO, CnabFormat.CNAB400, CnabFileType.RETORNO))

    // Then
    expect(error).toBeInstanceOf(CnabInvalidFileException)
    expect(error).toHaveProperty('errors', expectedErrors)
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
