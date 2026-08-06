import { getBoletoClass } from './boleto-registry'
import { CNABFormatCode } from '@/types/core/cnab'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { BoletoBradesco400 } from '@/banks/bradesco/boletos/boleto-bradesco-400'
import { CNABDocumentValidationError } from '@/types/errors/field-errors'

describe('getBoletoClass', () => {
  describe('CNAB 400', () => {
    test('retorna BoletoBradesco400 para Bradesco', () => {
      const BoletoClass = getBoletoClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB400)
      expect(BoletoClass).toBe(BoletoBradesco400)
    })

    test('lança erro para banco não registrado', () => {
      expect(() => getBoletoClass(BANK_CODES.ITAU, CNABFormatCode.CNAB400)).toThrow(
        CNABDocumentValidationError
      )
      expect(() => getBoletoClass(BANK_CODES.ITAU, CNABFormatCode.CNAB400)).toThrow(
        "combinação banco '341' + formato 'CNAB400' ainda não suportada"
      )
    })

    test('lança erro para código de banco inválido', () => {
      expect(() => getBoletoClass('999', CNABFormatCode.CNAB400)).toThrow(
        CNABDocumentValidationError
      )
      expect(() => getBoletoClass('999', CNABFormatCode.CNAB400)).toThrow(
        "combinação banco '999' + formato 'CNAB400' ainda não suportada"
      )
    })
  })

  describe('CNAB 240', () => {
    test('lança erro quando formato não tem registros', () => {
      expect(() => getBoletoClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB240)).toThrow(
        CNABDocumentValidationError
      )
      expect(() => getBoletoClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB240)).toThrow(
        "combinação banco '237' + formato 'CNAB240' ainda não suportada"
      )
    })
  })

  describe('BoletoConstructor type', () => {
    test('classe retornada pode instanciar boleto', () => {
      const BoletoClass = getBoletoClass(BANK_CODES.BRADESCO, CNABFormatCode.CNAB400)
      
      const line = '1'.padEnd(400, ' ')
      const boleto = new BoletoClass([line])
      
      expect(boleto).toBeInstanceOf(BoletoBradesco400)
    })
  })
})
