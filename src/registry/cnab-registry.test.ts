import { getCnabFileClass } from './cnab-registry'
import { CNABFormatCode } from '@/types/core/cnab'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { BoletoBradesco400 } from '@/banks/bradesco/boletos/boleto-bradesco-400'
import { BoletoBradesco240 } from '@/banks/bradesco/boletos/boleto-bradesco-240'
import { CnabFileBradesco400 } from '@/banks/bradesco/files/cnab-file-bradesco-400'
import { CnabFileBradesco240 } from '@/banks/bradesco/files/cnab-file-bradesco-240'
import { CNABFileValidationError } from '@/types/errors/field-errors'

const createValidBradesco400Header = (): string => {
  let header = '0'
  header += '1'
  header += 'REMESSA'
  header += '01'
  header += 'COBRANCA       '
  header += ' '.repeat(50)
  header += '237'
  header += 'BRADESCO       '
  header += ' '.repeat(300)
  header += '000001'
  return header
}

describe('getCnabFileClass', () => {
  describe('CNAB 400', () => {
    test('retorna CnabFileBradesco400 para Bradesco', () => {
      const FileClass = getCnabFileClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB400)
      expect(FileClass).toBe(CnabFileBradesco400)
    })

    test('lança erro para banco não registrado', () => {
      expect(() => getCnabFileClass(BANK_CODES.ITAU, CNABFormatCode.CNAB400)).toThrow(
        CNABFileValidationError
      )
      expect(() => getCnabFileClass(BANK_CODES.ITAU, CNABFormatCode.CNAB400)).toThrow(
        "combinação banco '341' + formato 'CNAB400' ainda não suportada"
      )
    })

    test('lança erro para código de banco inválido', () => {
      expect(() => getCnabFileClass('999', CNABFormatCode.CNAB400)).toThrow(
        CNABFileValidationError
      )
      expect(() => getCnabFileClass('999', CNABFormatCode.CNAB400)).toThrow(
        "combinação banco '999' + formato 'CNAB400' ainda não suportada"
      )
    })
  })

  describe('CNAB 240', () => {
    test('retorna CnabFileBradesco240 para Bradesco', () => {
      const FileClass = getCnabFileClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB240)
      expect(FileClass).toBe(CnabFileBradesco240)
    })

    test('lança erro para banco não registrado', () => {
      expect(() => getCnabFileClass(BANK_CODES.ITAU, CNABFormatCode.CNAB240)).toThrow(
        CNABFileValidationError
      )
      expect(() => getCnabFileClass(BANK_CODES.ITAU, CNABFormatCode.CNAB240)).toThrow(
        "combinação banco '341' + formato 'CNAB240' ainda não suportada"
      )
    })
  })

  describe('integração document + boleto', () => {
    test('documento instancia boleto correto internamente (CNAB 400)', () => {
      const FileClass = getCnabFileClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB400)
      
      const header = createValidBradesco400Header()
      const line = '1'.padEnd(400, ' ')
      const trailer = '9' + ' '.repeat(393) + '000003'
      const rawLines = [header, line, trailer]
      
      const document = new FileClass(rawLines)
      expect(document).toBeInstanceOf(CnabFileBradesco400)
      
      const boleto = document.getBoleto(0)
      expect(boleto).toBeInstanceOf(BoletoBradesco400)
    })

    test('documento instancia boleto correto internamente (CNAB 240)', () => {
      const FileClass = getCnabFileClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB240)
      
      const header = '237' + '0000' + '0' + ' '.repeat(134) + '1' + ' '.repeat(20) + '084' + ' '.repeat(74)
      const loteHeader = '237' + '0001' + '1' + ' '.repeat(232)
      const segP = '237' + '0001' + '3' + '00001' + 'P' + ' '.repeat(227)
      const segQ = '237' + '0001' + '3' + '00001' + 'Q' + ' '.repeat(227)
      const loteTrailer = '237' + '0001' + '5' + ' '.repeat(232)
      const trailer = '237' + '9999' + '9' + ' '.repeat(9) + '000006' + ' '.repeat(217)
      const rawLines = [header, loteHeader, segP, segQ, loteTrailer, trailer]
      
      const document = new FileClass(rawLines)
      expect(document).toBeInstanceOf(CnabFileBradesco240)
      
      const boleto = document.getBoleto(0)
      expect(boleto).toBeInstanceOf(BoletoBradesco240)
    })
  })
})
