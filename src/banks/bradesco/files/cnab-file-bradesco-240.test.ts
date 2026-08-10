import { CnabFileBradesco240 } from './cnab-file-bradesco-240'
import { BoletoBradesco240 } from '@/banks/bradesco/boletos/boleto-bradesco-240'
import * as fs from 'fs'
import * as path from 'path'

describe('CnabFileBradesco240', () => {
  let fixtureLines: string[]

  beforeAll(() => {
    const fixturePath = path.join(__dirname, '../docs/cnab240/bradesco_cnab_240.txt')
    const content = fs.readFileSync(fixturePath, 'latin1')
    fixtureLines = content.split(/\r?\n/).filter((line) => line.length > 0)
  })

  describe('construtor', () => {
    test('aceita arquivo válido', () => {
      expect(() => new CnabFileBradesco240(fixtureLines)).not.toThrow()
    })

    test('identifica quantidade correta de boletos', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

      expect(doc.boletoCount).toBe(3)
    })
  })

  describe('getBoleto', () => {
    test('retorna instância de BoletoBradesco240', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

      const boleto = doc.getBoleto(0)

      expect(boleto).toBeInstanceOf(BoletoBradesco240)
    })

    test('tipo retornado é BoletoBradesco240 (type safety)', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

      const boleto = doc.getBoleto(0)
      const result = boleto.readSimple()

      expect(result.errors).toHaveLength(0)
      expect(result.data.nossoNumero).toBeDefined()
      expect(result.data.numeroDocumento).toBeDefined()
    })

    test('cada boleto pode ser lido individualmente', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

      const boleto0 = doc.getBoleto(0)
      const boleto1 = doc.getBoleto(1)
      const boleto2 = doc.getBoleto(2)

      expect(boleto0).toBeInstanceOf(BoletoBradesco240)
      expect(boleto1).toBeInstanceOf(BoletoBradesco240)
      expect(boleto2).toBeInstanceOf(BoletoBradesco240)
    })

    test('boleto retornado pode ser lido com sucesso', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

      const boleto = doc.getBoleto(0)
      const result = boleto.readSimple()

      expect(result.errors).toHaveLength(0)
      expect(result.data.nossoNumero).toBeTruthy()
      expect(result.data.valor).toBeGreaterThan(0)
      expect(result.data.vencimento).toBeInstanceOf(Date)
    })
  })

  describe('readAll', () => {
    test('processa todos os boletos do documento', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

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

      const doc = new CnabFileBradesco240([header, trailer])

      expect(doc.boletoCount).toBe(0)
    })
  })
})

