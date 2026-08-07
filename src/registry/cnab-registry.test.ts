import { getCnabDocumentClass } from './cnab-registry'
import { CNABFormatCode } from '@/types/core/cnab'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { BoletoBradesco400 } from '@/banks/bradesco/boletos/boleto-bradesco-400'
import { BoletoBradesco240 } from '@/banks/bradesco/boletos/boleto-bradesco-240'
import { CnabDocumentBradesco400 } from '@/banks/bradesco/documents/cnab-document-bradesco-400'
import { CnabDocumentBradesco240 } from '@/banks/bradesco/documents/cnab-document-bradesco-240'
import { CNABDocumentValidationError } from '@/types/errors/field-errors'

describe('getCnabDocumentClass', () => {
  describe('CNAB 400', () => {
    test('retorna CnabDocumentBradesco400 para Bradesco', () => {
      const DocumentClass = getCnabDocumentClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB400)
      expect(DocumentClass).toBe(CnabDocumentBradesco400)
    })

    test('lança erro para banco não registrado', () => {
      expect(() => getCnabDocumentClass(BANK_CODES.ITAU, CNABFormatCode.CNAB400)).toThrow(
        CNABDocumentValidationError
      )
      expect(() => getCnabDocumentClass(BANK_CODES.ITAU, CNABFormatCode.CNAB400)).toThrow(
        "combinação banco '341' + formato 'CNAB400' ainda não suportada"
      )
    })

    test('lança erro para código de banco inválido', () => {
      expect(() => getCnabDocumentClass('999', CNABFormatCode.CNAB400)).toThrow(
        CNABDocumentValidationError
      )
      expect(() => getCnabDocumentClass('999', CNABFormatCode.CNAB400)).toThrow(
        "combinação banco '999' + formato 'CNAB400' ainda não suportada"
      )
    })
  })

  describe('CNAB 240', () => {
    test('retorna CnabDocumentBradesco240 para Bradesco', () => {
      const DocumentClass = getCnabDocumentClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB240)
      expect(DocumentClass).toBe(CnabDocumentBradesco240)
    })

    test('lança erro para banco não registrado', () => {
      expect(() => getCnabDocumentClass(BANK_CODES.ITAU, CNABFormatCode.CNAB240)).toThrow(
        CNABDocumentValidationError
      )
      expect(() => getCnabDocumentClass(BANK_CODES.ITAU, CNABFormatCode.CNAB240)).toThrow(
        "combinação banco '341' + formato 'CNAB240' ainda não suportada"
      )
    })
  })

  describe('integração document + boleto', () => {
    test('documento instancia boleto correto internamente (CNAB 400)', () => {
      const DocumentClass = getCnabDocumentClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB400)
      
      const header = '0'.padEnd(400, ' ')
      const line = '1'.padEnd(400, ' ')
      const trailer = '9'.padEnd(400, ' ')
      const rawLines = [header, line, trailer]
      
      const document = new DocumentClass(rawLines)
      expect(document).toBeInstanceOf(CnabDocumentBradesco400)
      
      const boleto = document.getBoleto(0)
      expect(boleto).toBeInstanceOf(BoletoBradesco400)
    })

    test('documento instancia boleto correto internamente (CNAB 240)', () => {
      const DocumentClass = getCnabDocumentClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB240)
      
      const header = '0' + ' '.repeat(6) + '0' + ' '.repeat(232)
      const loteHeader = '1' + ' '.repeat(6) + '1' + ' '.repeat(232)
      const segP = '3' + ' '.repeat(6) + '3' + ' '.repeat(5) + 'P' + ' '.repeat(226)
      const segQ = '3' + ' '.repeat(6) + '3' + ' '.repeat(5) + 'Q' + ' '.repeat(226)
      const loteTrailer = '5' + ' '.repeat(6) + '5' + ' '.repeat(232)
      const trailer = '9' + ' '.repeat(6) + '9' + ' '.repeat(232)
      const rawLines = [header, loteHeader, segP, segQ, loteTrailer, trailer]
      
      const document = new DocumentClass(rawLines)
      expect(document).toBeInstanceOf(CnabDocumentBradesco240)
      
      const boleto = document.getBoleto(0)
      expect(boleto).toBeInstanceOf(BoletoBradesco240)
    })
  })
})
