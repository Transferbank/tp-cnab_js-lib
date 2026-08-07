import { openCnabDocument } from './document-entry-point'
import { CNABBoletoValidationError } from '@/types/errors/field-errors'
import { CNABNoLinesProvidedError } from '@/types/errors/error-types'
import * as fs from 'fs'
import * as path from 'path'

describe('openCnabDocument', () => {
  const loadFixture400 = (): string[] => {
    const fixturePath = path.join(
      __dirname,
      'banks/bradesco/docs/cnab400/bradesco_cnab_400.txt'
    )
    const content = fs.readFileSync(fixturePath, 'latin1')
    return content.split(/\r?\n/).filter((line) => line.length > 0)
  }

  const loadFixture240 = (): string[] => {
    const fixturePath = path.join(
      __dirname,
      'banks/bradesco/docs/cnab240/bradesco_cnab_240.txt'
    )
    const content = fs.readFileSync(fixturePath, 'latin1')
    return content.split(/\r?\n/).filter((line) => line.length > 0)
  }

  describe('Bradesco CNAB 400', () => {
    test('identifica quantidade correta de boletos no fixture', () => {
      const lines = loadFixture400()
      const doc = openCnabDocument(lines)

      expect(doc.boletoCount).toBe(37)
    })

    test('lê dados completos do primeiro boleto corretamente', () => {
      const lines = loadFixture400()
      const doc = openCnabDocument(lines)

      const boleto = doc.getBoleto(0)
      const data = boleto.read()

      expect(data.nossoNumero).toBe('09100010629')
      expect(data.numeroDocumento).toBe('NF82760-03')
      expect(data.vencimento).toEqual(new Date(2026, 7, 24)) // agosto = mês 7 (0-indexed)
      expect(data.valor).toBe(22560.93)
      expect(data.dataEmissao).toEqual(new Date(2026, 4, 25)) // maio = mês 4
      expect(data.sacado.documento).toBe('20000000997330')
      expect(data.sacado.nome).toBe('COMERCIAL ALFA LTDA')
      expect(data.sacado.endereco.logradouro).toBe('AV EXEMPLO 200')
      expect(data.sacado.endereco.cep).toBe('29045402')
    })

    test('lê dados de múltiplos boletos corretamente', () => {
      const lines = loadFixture400()
      const doc = openCnabDocument(lines)

      // Primeiro boleto
      const boleto0 = doc.getBoleto(0)
      const data0 = boleto0.read()
      expect(data0.numeroDocumento).toBe('NF82760-03')
      expect(data0.valor).toBe(22560.93)

      // Segundo boleto
      const boleto1 = doc.getBoleto(1)
      const data1 = boleto1.read()
      expect(data1.numeroDocumento).toBe('NF82761-04')
      expect(data1.valor).toBe(2890.5)

      // Terceiro boleto
      const boleto2 = doc.getBoleto(2)
      const data2 = boleto2.read()
      expect(data2.numeroDocumento).toBe('NF82761-03')
      expect(data2.valor).toBe(2890.5)
    })

    test('readAll retorna dados corretos para todos os boletos', () => {
      const lines = loadFixture400()
      const doc = openCnabDocument(lines)

      const results = doc.readAll()

      expect(results).toHaveLength(37)
      
      // Verifica que todos foram processados com sucesso
      const successfulResults = results.filter((r) => r.success)
      expect(successfulResults).toHaveLength(37)

      // Verifica dados do primeiro boleto
      expect(results[0].success).toBe(true)
      expect(results[0].data).toBeDefined()
      const firstData = results[0].data as any
      expect(firstData.numeroDocumento).toBe('NF82760-03')
      expect(firstData.valor).toBe(22560.93)

      // Verifica dados do último boleto
      expect(results[36].success).toBe(true)
      expect(results[36].data).toBeDefined()
      const lastData = results[36].data as any
      expect(lastData.numeroDocumento).toBe('NF80387-03')
      expect(lastData.valor).toBe(1154.8)
    })

    test('boletos com satélites são processados corretamente', () => {
      const lines = loadFixture400()
      const doc = openCnabDocument(lines)

      // Primeiro boleto tem satélite tipo 2
      const boleto0 = doc.getBoleto(0)
      const data0 = boleto0.readFull()

      expect(data0.numeroDocumento).toBe('NF82760-03')
      expect(data0.extra).toBeDefined()
      expect(data0.extra?.codigoOcorrencia).toBeDefined()
    })
  })

  describe('Bradesco CNAB 240', () => {
    test('identifica quantidade correta de boletos no fixture', () => {
      expect(openCnabDocument(loadFixture240()).boletoCount).toBe(3)
    })

    test('lê dados completos do primeiro boleto corretamente', () => {
      const data = openCnabDocument(loadFixture240()).getBoleto(0).read()

      expect(data.nossoNumero).toBe('000123450010')
      expect(data.numeroDocumento).toBe('NF0000123')
      expect(data.vencimento).toEqual(new Date(2026, 11, 15))
      expect(data.valor).toBe(100)
      expect(data.dataEmissao).toEqual(new Date(2026, 11, 1))
      expect(data.sacado.documento).toBe('10000791989')
      expect(data.sacado.nome).toBe('JOAO EXEMPLO SILVA')
      expect(data.sacado.endereco.logradouro).toBe('RUA EXEMPLO 123')
      expect(data.sacado.endereco.cep).toBe('01234567')
    })

    test('lê dados de múltiplos boletos corretamente', () => {
      const doc = openCnabDocument(loadFixture240())

      expect(doc.getBoleto(1).read().numeroDocumento).toBe('NF0000124')
      expect(doc.getBoleto(1).read().valor).toBe(250)
      expect(doc.getBoleto(2).read().numeroDocumento).toBe('NF0000125')
      expect(doc.getBoleto(2).read().valor).toBe(500)
    })

    test('readAll retorna dados corretos para todos os boletos', () => {
      const results = openCnabDocument(loadFixture240()).readAll()

      expect(results).toHaveLength(3)
      expect(results.every((r) => r.success)).toBe(true)

      const first = results[0].data as any
      expect(first.numeroDocumento).toBe('NF0000123')
      expect(first.valor).toBe(100)

      const last = results[2].data as any
      expect(last.numeroDocumento).toBe('NF0000125')
      expect(last.valor).toBe(500)
    })

    test('boletos com campo extra carteira são processados corretamente', () => {
      const data = openCnabDocument(loadFixture240()).getBoleto(0).readFull()
      expect(data.extra?.carteira).toBe('001')
    })
  })

  describe('arquivo inválido', () => {
    test('linhas vazias lançam CNABNoLinesProvidedError', () => {
      expect(() => openCnabDocument([])).toThrow(CNABNoLinesProvidedError)
    })

    test('linha interna com tamanho errado: construção passa, getBoleto lança', () => {
      const header = '0' + ' '.repeat(75) + '237' + ' '.repeat(321)
      const invalidDetail = '1' + ' '.repeat(299)
      const trailer = '9' + ' '.repeat(399)

      const doc = openCnabDocument([header, invalidDetail, trailer])
      expect(doc.boletoCount).toBe(1)

      expect(() => doc.getBoleto(0)).toThrow(CNABBoletoValidationError)
      expect(() => doc.getBoleto(0)).toThrow('linha deve ter 400 caracteres, tem 300')
    })
  })
})
