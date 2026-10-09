import { describe, it, expect } from '@jest/globals'
import * as fs from 'fs'
import * as path from 'path'
import { CnabBoleto } from '@cnab/type/cnab'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabInvalidFileException } from '@cnab/exception/cnab-exception'
import { CnabInvalidLineSizeError } from '@cnab/type/cnab-validation-error'
import { CnabField, CnabFieldClass } from '@cnab/type/cnab-field'
import { CnabFieldType } from '@cnab/type/cnab-field-type'
import { CnabValidationResult } from '@cnab/type/cnab-validation-result'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFormat } from '@cnab/type/cnab-format'
import { Cnab240LineTypeChecker, Cnab400LineTypeChecker } from '@cnab/utils/line-type-checker'
import { CNAB_SEU_NUMERO_FIELDS } from '@cnab/bank/cnab-identification-fields'
import { readExampleLines, replaceLineRange, resPath } from '@test/test-utils'

function openExample(examplePath: string): CnabFile {
  const fullPath = path.join(resPath(), examplePath)
  const rawLines = readExampleLines(fullPath)
  return CnabFile.fromLines(rawLines)
}

class NossoNumeroExtraField extends CnabField<string> {
  static readonly fieldType = CnabFieldType.BOLETO
  readonly fieldKey = 'nosso_numero'
  readonly range: [number, number] = [63, 70]

  shouldValidate(): boolean {
    return Cnab400LineTypeChecker.isDetalhe(this.rawLine) || Cnab240LineTypeChecker.isSegmentoP(this.rawLine)
  }

  protected performValidation(): CnabValidationResult {
    return { isValid: true, errors: [] }
  }

  protected parseValue(rawValue: string): string {
    return rawValue
  }
}

class ItauCnab400NossoNumeroExtraField extends NossoNumeroExtraField {
  static readonly bank = CnabBank.ITAU
  static readonly format = CnabFormat.CNAB400
}

class BradescoCnab400NossoNumeroExtraField extends NossoNumeroExtraField {
  static readonly bank = CnabBank.BRADESCO
  static readonly format = CnabFormat.CNAB400
  readonly range: [number, number] = [71, 81]
}

function createFileFromPath(filePath: string): File {
  const buffer = fs.readFileSync(filePath)
  const blob = new Blob([buffer])
  return new File([blob], path.basename(filePath))
}

describe('cnab-file', (): void => {
  it.each([
    ['bradesco/cnab240/bradesco_cnab_240.txt', 'bradesco', '240', 17, 3],
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
    ['itau/cnab400/ITAU_cnab_400.REM']
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
    ['itau/cnab400/ITAU_cnab_400.REM', 2, 400]
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
    ['itau/cnab400/ITAU_cnab_400.REM', 319],
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
    const cnabFile = openExample('itau/cnab400/ITAU_cnab_400.REM')
    const expectedFirstBoleto = new CnabBoleto({
      fields: {
        nome_do_sacado: 'JOAO EXEMPLO SILVA - ME',
        data_de_vencimento: new Date(2026, 6, 6),
        valor_do_titulo: 6762.31,
        documento_do_sacado: '30000997300020',
        endereco_do_sacado: 'AV EXEMPLO 100',
        bairro_do_sacado: 'CENTRO',
        cep_do_sacado: '63540000',
        cidade_do_sacado: 'VARZEA ALEGRE',
        uf_do_sacado: 'CE'
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
    const rawLines = readExampleLines(path.join(resPath(), 'itau/cnab400/ITAU_cnab_400.REM'))
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
    ['itau/cnab400/ITAU_cnab_400.REM', (line: string): boolean => !line.startsWith('1')]
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

  it('given caixa cnab240 document file with blank address fields when reading then accepts it and omits those fields', (): void => {
    // No manual da Caixa CNAB240, as notas G032 a G036 descrevem endereço, bairro, CEP, cidade e UF do pagador
    //  como opcionais quando a emissão e a entrega do boleto são feitas pelo beneficiário.
    // Given
    const addressFieldKeys = ['endereco_do_sacado', 'bairro_do_sacado', 'cep_do_sacado', 'cidade_do_sacado', 'uf_do_sacado']
    const rawLines = readExampleLines(path.join(resPath(), 'caixa/cnab240/caixa_cnab_240.txt'))
      .map((line: string) => (line[7] == '3' && line[13] == 'Q' ? replaceLineRange(line, [74, 153], '') : line))
    const cnabFile = CnabFile.fromLines(rawLines)

    // When
    const result = cnabFile.validate(true)
    const cnab = cnabFile.read()

    // Then
    expect(result).toEqual({ isValid: true, errors: [] })
    expect(cnab.boletos.length).toBe(cnabFile.boletoCount)
    for (const boleto of cnab.boletos) {
      for (const fieldKey of addressFieldKeys) {
        expect(boleto.fields).not.toHaveProperty(fieldKey)
      }
    }
  })

  describe('extra fields filtered by bank and format', (): void => {
    it.each([
      ['an itau cnab400 field', 'itau/cnab400/ITAU_cnab_400.REM', ItauCnab400NossoNumeroExtraField, '10377333'],
      ['an itau cnab400 field', 'bradesco/cnab400/bradesco_cnab_400.txt', ItauCnab400NossoNumeroExtraField, undefined],
      ['an itau cnab400 field', 'itau/cnab240/itau_cnab_240.txt', ItauCnab400NossoNumeroExtraField, undefined],
      ['a field without bank and format', 'bradesco/cnab400/bradesco_cnab_400.txt', NossoNumeroExtraField, '00020200']
    ])('given %s when reading %s then reads it only if the file is in its scope', (_: string, examplePath: string, extraField: CnabFieldClass, expectedNossoNumero: string | undefined): void => {
      // Given
      const cnabFile = openExample(examplePath)

      // When
      const result = cnabFile.validate(true, [extraField])
      const cnab = cnabFile.read([extraField])

      // Then
      expect(result).toEqual({ isValid: true, errors: [] })
      expect(cnab.boletos[0].fields.nosso_numero).toBe(expectedNossoNumero)
    })

    it.each([
      ['itau/cnab400/ITAU_cnab_400.REM', [ItauCnab400NossoNumeroExtraField, BradescoCnab400NossoNumeroExtraField], '10377333'],
      ['bradesco/cnab400/bradesco_cnab_400.txt', [BradescoCnab400NossoNumeroExtraField, ItauCnab400NossoNumeroExtraField], '09100010629']
    ])('given extra fields of several banks with the same key, the other bank last, when reading %s then reads only the field of its bank', (examplePath: string, extraFields: CnabFieldClass[], expectedNossoNumero: string): void => {
      // Given
      const cnabFile = openExample(examplePath)

      // When
      const cnab = cnabFile.read(extraFields)

      // Then
      expect(cnab.boletos[0].fields.nosso_numero).toBe(expectedNossoNumero)
    })
  })

  it('given banco do brasil cnab400 with record 5 service type 03 when reading the seu número then it replaces the one in record 7', (): void => {
    // Given
    const cnabFile = openExample('banco-do-brasil/cnab400/banco_do_brasil_cnab_400.REM')

    // When
    const boletos = cnabFile.read(CNAB_SEU_NUMERO_FIELDS).boletos

    // Then
    expect(boletos[0].fields.seu_numero).toBe('NF82697-02')
    expect(boletos[boletos.length - 1].fields.seu_numero).toBe('PEDIDO1234-1/3')
  })
})
