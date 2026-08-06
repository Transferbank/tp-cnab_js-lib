import { openCnabDocument } from './document-entry-point'
import { CNABDocumentValidationError } from '@/types/errors/field-errors'
import { CnabDocumentBradesco400 } from '@/banks/bradesco/documents/cnab-document-bradesco-400'
import * as fs from 'fs'
import * as path from 'path'

describe('openCnabDocument', () => {
  const loadFixture = (): string[] => {
    const fixturePath = path.join(
      __dirname,
      'banks/bradesco/docs/cnab400/bradesco_cnab_400.txt'
    )
    const content = fs.readFileSync(fixturePath, 'latin1')
    return content.split(/\r?\n/).filter((line) => line.length > 0)
  }

  describe('Bradesco CNAB 400', () => {
    test('retorna CnabDocumentBradesco400 para arquivo válido', () => {
      const lines = loadFixture()
      const doc = openCnabDocument(lines)

      expect(doc).toBeInstanceOf(CnabDocumentBradesco400)
    })

    test('identifica quantidade correta de boletos no fixture', () => {
      const lines = loadFixture()
      const doc = openCnabDocument(lines)

      expect(doc.boletoCount).toBeGreaterThan(0)
      expect(doc.boletoCount).toBe(37)
    })

    test('getBoleto retorna boletos válidos', () => {
      const lines = loadFixture()
      const doc = openCnabDocument(lines)

      const boleto = doc.getBoleto(0)
      expect(boleto).toBeDefined()

      const data = boleto.read()
      expect(data.nossoNumero).toBeDefined()
      expect(data.numeroDocumento).toBe('NF82760-03')
    })

    test('lê dados completos do primeiro boleto corretamente', () => {
      const lines = loadFixture()
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
      const lines = loadFixture()
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
      const lines = loadFixture()
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
      const lines = loadFixture()
      const doc = openCnabDocument(lines)

      // Primeiro boleto tem satélite tipo 2
      const boleto0 = doc.getBoleto(0)
      const data0 = boleto0.readFull()

      expect(data0.numeroDocumento).toBe('NF82760-03')
      expect(data0.extra).toBeDefined()
      expect(data0.extra?.codigoOcorrencia).toBeDefined()
    })

    test('readAll processa todos os boletos com sucesso', () => {
      const lines = loadFixture()
      const doc = openCnabDocument(lines)

      const results = doc.readAll()

      expect(results).toHaveLength(37)
      expect(results.filter((r) => r.success).length).toBe(37)
      expect(results.every((r) => r.data != null || r.error != null)).toBe(true)
    })
  })

  describe('banco não suportado', () => {
    test('lança CNABDocumentValidationError para Itaú', () => {
      const header = '0' + ' '.repeat(75) + '341' + ' '.repeat(321)
      const detail = '1' + ' '.repeat(399)
      const trailer = '9' + ' '.repeat(399)
      const lines = [header, detail, trailer]

      expect(() => openCnabDocument(lines)).toThrow(
        CNABDocumentValidationError
      )
      expect(() => openCnabDocument(lines)).toThrow(
        "combinação banco '341' + formato 'CNAB400' ainda não suportada"
      )
    })
  })

  describe('formato não suportado', () => {
    test('lança CNABDocumentValidationError para Bradesco CNAB 240', () => {
      const header = '237' + ' '.repeat(237)
      const batchHeader = '1' + ' '.repeat(239)
      const segmentP = '3' + ' '.repeat(11) + 'P' + ' '.repeat(227)
      const segmentQ = '3' + ' '.repeat(11) + 'Q' + ' '.repeat(227)
      const batchTrailer = '5' + ' '.repeat(239)
      const trailer = '9' + ' '.repeat(239)
      const lines = [header, batchHeader, segmentP, segmentQ, batchTrailer, trailer]

      expect(() => openCnabDocument(lines)).toThrow(
        CNABDocumentValidationError
      )
      expect(() => openCnabDocument(lines)).toThrow(
        "combinação banco '237' + formato 'CNAB240' ainda não suportada"
      )
    })
  })

  describe('arquivo inválido', () => {
    test('propaga erro de detectFormat para linhas vazias', () => {
      expect(() => openCnabDocument([])).toThrow()
    })

    test('propaga erro de validação estrutural', () => {
      const header = '0' + ' '.repeat(399)
      const invalidDetail = '1' + ' '.repeat(299)
      const trailer = '9' + ' '.repeat(399)
      const lines = [header, invalidDetail, trailer]

      expect(() => openCnabDocument(lines)).toThrow()
    })
  })
})
