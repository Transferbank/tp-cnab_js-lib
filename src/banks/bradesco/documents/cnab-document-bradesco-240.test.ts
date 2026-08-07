import { CnabDocumentBradesco240 } from './cnab-document-bradesco-240'
import { BoletoBradesco240 } from '@/banks/bradesco/boletos/boleto-bradesco-240'
import * as fs from 'fs'
import * as path from 'path'

describe('CnabDocumentBradesco240', () => {
  let fixtureLines: string[]

  beforeAll(() => {
    const fixturePath = path.join(__dirname, '../docs/cnab240/bradesco_cnab_240.txt')
    const content = fs.readFileSync(fixturePath, 'latin1')
    fixtureLines = content.split(/\r?\n/).filter((line) => line.length > 0)
  })

  describe('construtor', () => {
    test('aceita arquivo válido', () => {
      expect(() => new CnabDocumentBradesco240(fixtureLines)).not.toThrow()
    })

    test('identifica quantidade correta de boletos', () => {
      const doc = new CnabDocumentBradesco240(fixtureLines)

      expect(doc.boletoCount).toBe(3)
    })
  })

  describe('getBoleto', () => {
    test('retorna instância de BoletoBradesco240', () => {
      const doc = new CnabDocumentBradesco240(fixtureLines)

      const boleto = doc.getBoleto(0)

      expect(boleto).toBeInstanceOf(BoletoBradesco240)
    })

    test('tipo retornado é BoletoBradesco240 (type safety)', () => {
      const doc = new CnabDocumentBradesco240(fixtureLines)

      const boleto = doc.getBoleto(0)
      const data = boleto.readSimple()

      expect(data.nossoNumero).toBeDefined()
      expect(data.numeroDocumento).toBeDefined()
    })

    test('cada boleto pode ser lido individualmente', () => {
      const doc = new CnabDocumentBradesco240(fixtureLines)

      const boleto0 = doc.getBoleto(0)
      const boleto1 = doc.getBoleto(1)
      const boleto2 = doc.getBoleto(2)

      expect(boleto0).toBeInstanceOf(BoletoBradesco240)
      expect(boleto1).toBeInstanceOf(BoletoBradesco240)
      expect(boleto2).toBeInstanceOf(BoletoBradesco240)
    })

    test('boleto retornado pode ser lido com sucesso', () => {
      const doc = new CnabDocumentBradesco240(fixtureLines)

      const boleto = doc.getBoleto(0)
      const data = boleto.readSimple()

      expect(data.nossoNumero).toBeTruthy()
      expect(data.valor).toBeGreaterThan(0)
      expect(data.vencimento).toBeInstanceOf(Date)
    })
  })

  describe('readAll', () => {
    test('processa todos os boletos do documento', () => {
      const doc = new CnabDocumentBradesco240(fixtureLines)

      const results = doc.readAll()

      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      expect(results[0].index).toBe(0)
      expect(results[1].index).toBe(1)
      expect(results[2].index).toBe(2)
    })
  })

  describe('arquivo sem boletos', () => {
    test('aceita arquivo com apenas header e trailer', () => {
      const header = ' '.repeat(7) + '0' + ' '.repeat(232)
      const trailer = ' '.repeat(7) + '9' + ' '.repeat(232)

      const doc = new CnabDocumentBradesco240([header, trailer])

      expect(doc.boletoCount).toBe(0)
    })
  })
})

