import { describe, it, expect } from '@jest/globals'
import { Cnab, CnabBoleto, CnabHeader } from '@cnab/type/cnab'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabFileType } from '@cnab/type/cnab-file-type'
import { CnabFormat } from '@cnab/type/cnab-format'
import { CnabWriter } from '@cnab/type/cnab-writer'
import { CNAB_RETORNO_BANK_SCHEMAS } from '@cnab/bank/cnab-retorno-bank-schemas'
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

  it('given keys that do not exist in the layout of their line when writing then throws an invalid file exception with an error for each key', (): void => {
    // Given
    const cnab = new Cnab({
      header: new CnabHeader({ fields: { codigo_de_ocorrencia: '06' } }),
      boletos: [new CnabBoleto({ fields: { codigo_de_ocorrencia: '06', data_de_credito: new Date(2026, 5, 3) } })]
    })
    const expectedErrors = [
      new CnabGenericFieldError({
        message: 'Campo codigo_de_ocorrencia não existe no layout do header',
        lineNumber: 0,
        fieldKey: 'codigo_de_ocorrencia',
        range: [1, 400]
      }),
      new CnabGenericFieldError({
        message: 'Campo data_de_credito não existe no layout do boleto',
        lineNumber: 1,
        fieldKey: 'data_de_credito',
        range: [1, 400]
      })
    ]

    // When
    const error = captureError((): string[] => CnabWriter.write(cnab, CnabBank.BRADESCO, CnabFormat.CNAB400, CnabFileType.RETORNO))

    // Then
    expect(error).toBeInstanceOf(CnabInvalidFileException)
    expect(error).toHaveProperty('errors', expectedErrors)
  })

  it('given a code in lowercase when writing then writes it in uppercase without reporting a difference', (): void => {
    // Given
    const cnab = new Cnab({ boletos: [new CnabBoleto({ fields: { codigo_de_ocorrencia: 'ab' } })] })

    // When
    const lines = CnabWriter.write(cnab, CnabBank.BRADESCO, CnabFormat.CNAB400, CnabFileType.RETORNO)

    // Then
    expect(lines[1].substring(108, 110)).toBe('AB')
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

  it('given an Itaú CNAB 400 liquidação with valor pago and juros e multa when writing then both are read back from the written file', (): void => {
    // Given
    const boleto = new CnabBoleto({ fields: { codigo_de_ocorrencia: '06', valor_pago: 102.5, juros_multa: 2.5 } })
    const cnab = new Cnab({ boletos: [boleto] })

    // When
    const lines = CnabWriter.write(cnab, CnabBank.ITAU, CnabFormat.CNAB400, CnabFileType.RETORNO)
    const read = CnabFile.fromLines(lines).read()

    // Then
    expect(read.boletos[0].fields).toEqual(boleto.fields)
  })

  it('given an Itaú CNAB 400 baixa with valor pago when writing then reports that the value is not read back, since the bank only reads it on liquidação', (): void => {
    // Given
    const cnab = new Cnab({ boletos: [new CnabBoleto({ fields: { codigo_de_ocorrencia: '09', valor_pago: 100 } })] })
    const expectedErrors = [
      new CnabGenericFieldError({
        message: 'Campo valor_pago foi informado como 100, mas o layout do banco não lê esse campo com o conteúdo desta linha, como o código de ocorrência',
        lineNumber: 1,
        fieldKey: 'valor_pago',
        range: [254, 266]
      })
    ]

    // When
    const error = captureError((): string[] => CnabWriter.write(cnab, CnabBank.ITAU, CnabFormat.CNAB400, CnabFileType.RETORNO))

    // Then
    expect(error).toBeInstanceOf(CnabInvalidFileException)
    expect(error).toHaveProperty('errors', expectedErrors)
  })

  it('given a Caixa CNAB 400 liquidação with valor pago, juros pago and multa paga when writing then writes the principal and reads back the informed values', (): void => {
    // Given
    const boleto = new CnabBoleto({ fields: { codigo_de_ocorrencia: '21', valor_pago: 105, juros_pago: 3, multa_paga: 2 } })
    const cnab = new Cnab({ boletos: [boleto] })

    // When
    const lines = CnabWriter.write(cnab, CnabBank.CAIXA, CnabFormat.CNAB400, CnabFileType.RETORNO)
    const writtenPrincipal = lines[1].substring(253, 266)
    const read = CnabFile.fromLines(lines).read()

    // Then
    expect(writtenPrincipal).toBe('0000000010000')
    expect(read.boletos[0].fields).toEqual(boleto.fields)
  })

  it('given a Caixa CNAB 400 boleto whose juros pago and multa paga exceed the valor pago when writing then reports that the valor pago cannot be written', (): void => {
    // Given
    const cnab = new Cnab({ boletos: [new CnabBoleto({ fields: { codigo_de_ocorrencia: '21', valor_pago: 1, juros_pago: 5 } })] })
    const expectedErrors = [
      new CnabGenericFieldError({
        message: 'Campo valor_pago não pode ser escrito: valor 1 é menor que juros_pago e multa_paga somados',
        lineNumber: 1,
        fieldKey: 'valor_pago',
        range: [254, 266]
      })
    ]

    // When
    const error = captureError((): string[] => CnabWriter.write(cnab, CnabBank.CAIXA, CnabFormat.CNAB400, CnabFileType.RETORNO))

    // Then
    expect(error).toBeInstanceOf(CnabInvalidFileException)
    expect(error).toHaveProperty('errors', expectedErrors)
  })

  const nossoNumeroCases: Array<[CnabBank, string, [number, number], string, string]> = [
    [CnabBank.ITAU, '10014', [63, 70], '00010014', '00010014'],
    [CnabBank.BANCODOBRASIL, '10014', [64, 80], '00000000000010014', '00000000000010014'],
    [CnabBank.BRADESCO, '09100010141P', [71, 82], '09100010141P', '09100010141P'],
    [CnabBank.SICREDI, '262000001', [48, 62], '262000001      ', '262000001']
  ]

  it.each(nossoNumeroCases)('given a %s CNAB 400 nosso número %s when writing then fills its range as the layout does and reads it back', (bank: CnabBank, nossoNumero: string, range: [number, number], expectedRaw: string, expectedRead: string): void => {
    // Given
    const cnab = new Cnab({ boletos: [new CnabBoleto({ fields: { codigo_de_ocorrencia: '06', nosso_numero: nossoNumero } })] })

    // When
    const lines = CnabWriter.write(cnab, bank, CnabFormat.CNAB400, CnabFileType.RETORNO)
    const writtenNossoNumero = lines[1].substring(range[0] - 1, range[1])
    const read = CnabFile.fromLines(lines).read()

    // Then
    expect(writtenNossoNumero).toBe(expectedRaw)
    expect(read.boletos[0].fields.nosso_numero).toBe(expectedRead)
  })

  it('given a seu número and an uso da empresa in lowercase with accents when writing then writes them in uppercase without accents, padded with spaces, and reads them back', (): void => {
    // Given
    const cnab = new Cnab({
      boletos: [new CnabBoleto({ fields: { codigo_de_ocorrencia: '06', seu_numero: 'nf 123', uso_da_empresa: 'pedido ação 12' } })]
    })

    // When
    const lines = CnabWriter.write(cnab, CnabBank.BRADESCO, CnabFormat.CNAB400, CnabFileType.RETORNO)
    const writtenSeuNumero = lines[1].substring(116, 126)
    const writtenUsoDaEmpresa = lines[1].substring(37, 62)
    const read = CnabFile.fromLines(lines).read()

    // Then
    expect(writtenSeuNumero).toBe('NF 123    ')
    expect(writtenUsoDaEmpresa).toBe('PEDIDO ACAO 12           ')
    expect(read.boletos[0].fields.seu_numero).toBe('NF 123')
    expect(read.boletos[0].fields.uso_da_empresa).toBe('PEDIDO ACAO 12')
  })

  it('given a data de ocorrência when writing then writes it as DDMMAA and reads it back', (): void => {
    // Given
    const dataDeOcorrencia = new Date(2027, 0, 2)
    const cnab = new Cnab({ boletos: [new CnabBoleto({ fields: { codigo_de_ocorrencia: '06', data_de_ocorrencia: dataDeOcorrencia } })] })

    // When
    const lines = CnabWriter.write(cnab, CnabBank.BRADESCO, CnabFormat.CNAB400, CnabFileType.RETORNO)
    const writtenDataDeOcorrencia = lines[1].substring(110, 116)
    const read = CnabFile.fromLines(lines).read()

    // Then
    expect(writtenDataDeOcorrencia).toBe('020127')
    expect(read.boletos[0].fields.data_de_ocorrencia).toEqual(dataDeOcorrencia)
  })

  it('given a data de ocorrência in a year that two digits cannot represent when writing then reports that it cannot be written', (): void => {
    // Given
    const cnab = new Cnab({ boletos: [new CnabBoleto({ fields: { codigo_de_ocorrencia: '06', data_de_ocorrencia: new Date(2050, 0, 2) } })] })
    const expectedErrors = [
      new CnabGenericFieldError({
        message: 'Campo data_de_ocorrencia não pode ser escrito: ano 2050 não pode ser escrito com 2 dígitos',
        lineNumber: 1,
        fieldKey: 'data_de_ocorrencia',
        range: [111, 116]
      })
    ]

    // When
    const error = captureError((): string[] => CnabWriter.write(cnab, CnabBank.BRADESCO, CnabFormat.CNAB400, CnabFileType.RETORNO))

    // Then
    expect(error).toBeInstanceOf(CnabInvalidFileException)
    expect(error).toHaveProperty('errors', expectedErrors)
  })

  it('given an uso da empresa for Sicredi CNAB 400, whose retorno has no such field, when writing then reports the key as outside the layout', (): void => {
    // Given
    const cnab = new Cnab({ boletos: [new CnabBoleto({ fields: { codigo_de_ocorrencia: '06', uso_da_empresa: 'PEDIDO 12' } })] })
    const expectedErrors = [
      new CnabGenericFieldError({
        message: 'Campo uso_da_empresa não existe no layout do boleto',
        lineNumber: 1,
        fieldKey: 'uso_da_empresa',
        range: [1, 400]
      })
    ]

    // When
    const error = captureError((): string[] => CnabWriter.write(cnab, CnabBank.SICREDI, CnabFormat.CNAB400, CnabFileType.RETORNO))

    // Then
    expect(error).toBeInstanceOf(CnabInvalidFileException)
    expect(error).toHaveProperty('errors', expectedErrors)
  })

  const commonFields = {
    valor_pago: 105,
    seu_numero: 'NF 123',
    uso_da_empresa: 'PEDIDO 12',
    data_de_ocorrencia: new Date(2026, 5, 3)
  }
  const fullBoletoCases: Array<[CnabBank, Record<string, unknown>]> = [
    [CnabBank.BANCODOBRASIL, { ...commonFields, codigo_de_ocorrencia: '06', nosso_numero: '12345678901234567', juros_multa: 5 }],
    [CnabBank.BRADESCO, { ...commonFields, codigo_de_ocorrencia: '06', nosso_numero: '09100010141P', juros_multa: 5 }],
    [CnabBank.CAIXA, { ...commonFields, codigo_de_ocorrencia: '21', nosso_numero: '14000000000001234', juros_pago: 3, multa_paga: 2 }],
    [CnabBank.ITAU, { ...commonFields, codigo_de_ocorrencia: '06', nosso_numero: '12345678', juros_multa: 5 }],
    [CnabBank.SANTANDER, { ...commonFields, codigo_de_ocorrencia: '06', nosso_numero: '12345678', juros_multa: 5 }],
    [CnabBank.SICOOB, { ...commonFields, codigo_de_ocorrencia: '06', nosso_numero: '000000123456', juros_multa: 5 }],
    [CnabBank.SICREDI, { valor_pago: 105, seu_numero: 'NF 123', data_de_ocorrencia: new Date(2026, 5, 3), codigo_de_ocorrencia: '06', nosso_numero: '262000001', juros_pago: 3, multa_paga: 2 }]
  ]

  it.each(fullBoletoCases)('given a %s CNAB 400 liquidação with every field of the layout when writing then no field overwrites another and all are read back', (bank: CnabBank, fields: Record<string, unknown>): void => {
    // Given
    const boleto = new CnabBoleto({ fields })
    const cnab = new Cnab({ boletos: [boleto] })
    const layoutKeys: string[] = []
    for (const fieldClass of CNAB_RETORNO_BANK_SCHEMAS[bank][CnabFormat.CNAB400].boleto.fields) {
      layoutKeys.push(new fieldClass('', 0).fieldKey)
    }

    // When
    const lines = CnabWriter.write(cnab, bank, CnabFormat.CNAB400, CnabFileType.RETORNO)
    const read = CnabFile.fromLines(lines).read()
    const informedKeys = Object.keys(fields)
    informedKeys.sort()
    layoutKeys.sort()

    // Then
    expect(informedKeys).toEqual(layoutKeys)
    expect(read.boletos[0].fields).toEqual(boleto.fields)
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
