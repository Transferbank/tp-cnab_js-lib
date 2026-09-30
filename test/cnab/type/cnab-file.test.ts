import { describe, it, expect } from '@jest/globals'
import * as fs from 'fs'
import * as path from 'path'
import { CnabBoleto } from '@cnab/type/cnab'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabInvalidFileException } from '@cnab/exception/cnab-exception'
import { CnabGroupMissingSegmentError, CnabInvalidLineSizeError } from '@cnab/type/cnab-validation-error'
import { readExampleLines, resPath } from '@test/test-utils'

function openExample(examplePath: string): CnabFile {
  const fullPath = path.join(resPath(), examplePath)
  const rawLines = readExampleLines(fullPath)
  return CnabFile.fromLines(rawLines)
}

function createFileFromPath(filePath: string): File {
  const buffer = fs.readFileSync(filePath)
  const blob = new Blob([buffer])
  return new File([blob], path.basename(filePath))
}

describe('cnab-file', (): void => {
  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt', 'bradesco', '240', 16, 3],
    ['bradesco/cnab400/bradesco_cnab_400.txt', 'bradesco', '400', 76, 37]
  ])(
    'given document file when opening then detects bank, format, lines and boleto count',
    async (
      examplePath: string,
      expectedBank: string,
      expectedFormat: string,
      expectedLineCount: number,
      expectedBoletoCount: number
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
      expect(cnabFile.boletoCount).toBe(expectedBoletoCount)
      expect(cnabFile.schema).not.toBeNull()
    }
  )

  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt'],
    ['bradesco/cnab400/bradesco_cnab_400.txt']
  ])(
    'given valid document file when validating with feedback then reports no errors',
    async (examplePath: string): Promise<void> => {
      // Given
      const fullPath = path.join(resPath(), examplePath)
      const file = createFileFromPath(fullPath)
      const cnabFile = await CnabFile.open(file)

      // When
      const result = cnabFile.validate(true)

      // Then
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
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

  it.each([
    ['banco-do-brasil/cnab240/banco_do_brasil_cnab_240.txt', 3],
    ['bradesco/cnab240/bradesco_cnab_240.txt', 3],
    ['bradesco/cnab400/bradesco_cnab_400.txt', 37],
    ['caixa/cnab240/caixa_cnab_240.txt', 3],
    ['itau/cnab240/itau_cnab_240.txt', 4],
    ['santander/cnab240/santander_cnab_240.txt', 3],
    ['sicoob/cnab240/sicoob_cnab_240.txt', 3],
    ['sicredi/cnab240/sicredi_cnab_240.txt', 3]
  ])(
    'given valid document file from any bank when opening and validating then reports the right boleto count and no errors',
    (examplePath: string, expectedBoletoCount: number): void => {
      // Given
      const cnabFile = openExample(examplePath)

      // When
      const result = cnabFile.validate(true)

      // Then
      expect(cnabFile.boletoCount).toBe(expectedBoletoCount)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    }
  )

  it('given valid cnab240 document file when reading then extracts every boleto field', (): void => {
    // Given
    const cnabFile = openExample('itau/cnab240/itau_cnab_240.txt')
    const expectedBoletos = [
      new CnabBoleto({
        fields: {
          nome_do_sacado: 'JOAO EXEMPLO SILVA',
          data_de_vencimento: new Date(2026, 11, 15),
          valor_do_titulo: 10000,
          documento_do_sacado: '11122233396',
          endereco_do_sacado: 'RUA EXEMPLO, 100',
          bairro_do_sacado: 'CENTRO',
          cep_do_sacado: '01234567',
          cidade_do_sacado: 'SAO PAULO',
          uf_do_sacado: 'SP'
        }
      }),
      new CnabBoleto({
        fields: {
          nome_do_sacado: 'COMERCIAL EXEMPLO LTDA',
          data_de_vencimento: new Date(2026, 11, 20),
          valor_do_titulo: 25000,
          documento_do_sacado: '11122233300063',
          endereco_do_sacado: 'RUA EXEMPLO, 100',
          bairro_do_sacado: 'CENTRO',
          cep_do_sacado: '01234567',
          cidade_do_sacado: 'SAO PAULO',
          uf_do_sacado: 'SP'
        }
      }),
      new CnabBoleto({
        fields: {
          nome_do_sacado: 'INDUSTRIA EXEMPLO SA',
          data_de_vencimento: new Date(2026, 11, 22),
          valor_do_titulo: 50000,
          documento_do_sacado: '44455566600024',
          endereco_do_sacado: 'RUA EXEMPLO, 100',
          bairro_do_sacado: 'CENTRO',
          cep_do_sacado: '01234567',
          cidade_do_sacado: 'CAMPINAS',
          uf_do_sacado: 'SP'
        }
      }),
      new CnabBoleto({
        fields: {
          nome_do_sacado: 'MARIA EXEMPLO SILVA',
          data_de_vencimento: new Date(2026, 11, 31),
          valor_do_titulo: 7500,
          documento_do_sacado: '44455566619',
          endereco_do_sacado: 'RUA EXEMPLO, 100',
          bairro_do_sacado: 'CENTRO',
          cep_do_sacado: '01234567',
          cidade_do_sacado: 'CAMPINAS',
          uf_do_sacado: 'SP'
        }
      })
    ]

    // When
    const cnab = cnabFile.read()

    // Then
    expect(cnab.boletos).toEqual(expectedBoletos)
  })

  it('given valid cnab400 document file when reading then extracts every boleto field', (): void => {
    // Given
    const cnabFile = openExample('bradesco/cnab400/bradesco_cnab_400.txt')
    const expectedFirstBoleto = new CnabBoleto({
      fields: {
        nome_do_sacado: 'COMERCIAL ALFA LTDA',
        data_de_vencimento: new Date(2026, 7, 24),
        valor_do_titulo: 22560.93,
        documento_do_sacado: '20000000997330',
        endereco_do_sacado: 'AV EXEMPLO 200',
        cep_do_sacado: '29045402'
      }
    })

    // When
    const cnab = cnabFile.read()

    // Then
    expect(cnab.boletos.length).toBe(cnabFile.boletoCount)
    expect(cnab.boletos[0]).toEqual(expectedFirstBoleto)
  })

  it('given document file with invalid lines when reading then throws with the first validation error', (): void => {
    // Given
    const truncatedSize = 5
    const rawLines = readExampleLines(path.join(resPath(), 'bradesco/cnab400/bradesco_cnab_400.txt'))
    rawLines[2] = rawLines[2].substring(0, truncatedSize)
    rawLines[4] = rawLines[4].substring(0, truncatedSize)
    const cnabFile = CnabFile.fromLines(rawLines)
    const expectedErrors = [
      new CnabInvalidLineSizeError({ lineNumber: 2, expectedSize: 400, actualSize: truncatedSize })
    ]

    // When
    const read = (): unknown => cnabFile.read()

    // Then
    expect(read).toThrow(CnabInvalidFileException)
    expect(read).toThrow(
      'Arquivo CNAB inválido: 1 erro(s) encontrado(s). ' +
      'Primeiro erro na linha 3: Tamanho de linha inválido: esperado 400, recebido 5'
    )
    try {
      cnabFile.read()
    } catch (error) {
      expect((error as CnabInvalidFileException).errors).toEqual(expectedErrors)
    }
  })

  it.each([
    ['itau/cnab240/itau_cnab_240.txt', (line: string): boolean => line[7] !== '3'],
    ['bradesco/cnab400/bradesco_cnab_400.txt', (line: string): boolean => !line.startsWith('1')]
  ])(
    'given document file %s without boleto lines when reading then returns no boletos',
    (examplePath: string, isNotBoletoLine: (line: string) => boolean): void => {
      // Given
      const rawLines = readExampleLines(path.join(resPath(), examplePath)).filter(isNotBoletoLine)
      const cnabFile = CnabFile.fromLines(rawLines)

      // When
      const cnab = cnabFile.read()

      // Then
      expect(cnabFile.boletoCount).toBe(0)
      expect(cnab.boletos).toEqual([])
    }
  )

  it('given cnab240 document file without segment Q when validating then reports one missing segment per boleto', (): void => {
    // Given
    const isSegmentoQ = (line: string): boolean => line[7] === '3' && line[13] === 'Q'
    const isSegmentoP = (line: string): boolean => line[7] === '3' && line[13] === 'P'
    const rawLines = readExampleLines(path.join(resPath(), 'itau/cnab240/itau_cnab_240.txt'))
      .filter((line: string) => !isSegmentoQ(line))
    const cnabFile = CnabFile.fromLines(rawLines)
    const expectedErrors = rawLines
      .map((line: string, lineNumber: number) => (isSegmentoP(line) ? lineNumber : -1))
      .filter((lineNumber: number) => lineNumber >= 0)
      .map((lineNumber: number) => new CnabGroupMissingSegmentError({ lineNumber, segmentName: 'segmento Q' }))

    // When
    const result = cnabFile.validate(true)

    // Then
    expect(expectedErrors.length).toBe(cnabFile.boletoCount)
    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(expectedErrors)
    expect(() => cnabFile.read()).toThrow(CnabInvalidFileException)
  })
})
