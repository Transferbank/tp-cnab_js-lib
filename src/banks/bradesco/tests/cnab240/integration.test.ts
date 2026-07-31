/**
 * Testes de Integração - Bradesco CNAB 240
 * 
 * Valida o parsing completo de arquivos CNAB reais com múltiplos títulos.
 * Testa a estrutura geral do arquivo e extração de todos os campos principais.
 */

import { bradescoCnab240 } from '@banks/bradesco/schemas/cnab240'
import { extractLineFields } from '@parser/field-extractor'
import { readFixture, findSegmentLines } from './shared'
import { loadCnab240Metadata, type FixtureMetadata, type FixtureRecord } from '../test-helpers'

describe('Schema Bradesco CNAB 240 - Integração (Parsing Completo)', () => {
  let lines: string[]
  let metadata: FixtureMetadata

  beforeAll(() => {
    lines = readFixture('remessa-multipla.txt')
    metadata = loadCnab240Metadata()
  })

  describe('Estrutura do arquivo', () => {
    test('deve ter número correto de linhas (do JSON)', () => {
      expect(lines).toHaveLength(metadata.structure!.totalLines)
    })

    test('deve ter 240 caracteres em cada linha', () => {
      lines.forEach((line: string) => {
        expect(line.length).toBe(240)
      })
    })

    test('deve parsear todos os campos sem erros de extração', () => {
      // Header de Arquivo
      const headerArquivo = extractLineFields(lines[0], bradescoCnab240.headerArquivo!)
      expect(headerArquivo.controle_banco.error).toBeFalsy()
      expect(headerArquivo.cedente_nome.error).toBeFalsy()
      expect(headerArquivo.arquivo_data_de_geracao.error).toBeFalsy()

      // Segmentos P e Q são localizados pelo conteúdo (pos 8 = '3', pos 14 = letra do
      // segmento), não por éndice fixo, já que o arquivo também tem Header de Lote e
      // Segmentos R/S entre os títulos.
      const segPLines = findSegmentLines(lines, 'P')
      const segQLines = findSegmentLines(lines, 'Q')

      segPLines.forEach((line: string) => {
        const segP = extractLineFields(line, bradescoCnab240.segmentoP!)
        expect(segP.controle_banco.error).toBeFalsy()
        expect(segP.valor_titulo.error).toBeFalsy()
        expect(segP.vencimento_titulo.error).toBeFalsy()
      })

      segQLines.forEach((line: string) => {
        const segQ = extractLineFields(line, bradescoCnab240.segmentoQ!)
        expect(segQ.sacado_nome.error).toBeFalsy()
        expect(segQ.sacado_inscricao_numero.error).toBeFalsy()
      })

      // Trailer de Arquivo
      const trailerArquivo = extractLineFields(lines[lines.length - 1], bradescoCnab240.trailerArquivo!)
      expect(trailerArquivo.controle_banco.error).toBeFalsy()
    })
  })

  describe('Contagem de registros', () => {
    test('deve parsear quantidade correta de títulos (do JSON)', () => {
      // Contagem de segmentos P (cada título tem um segmento P), identificados pelo
      // conteúdo da linha (pos 8 = '3', pos 14 = 'P')
      const segmentosP = findSegmentLines(lines, 'P')

      expect(segmentosP.length).toBe(metadata.records.length)
    })
  })

  describe('Extração de todos os campos principais', () => {
    test('deve extrair todos os campos principais de todos os títulos', () => {
      expect(metadata.records.length).toBeGreaterThan(0)

      const segPLines = findSegmentLines(lines, 'P')
      const segQLines = findSegmentLines(lines, 'Q')

      metadata.records.forEach((expected: FixtureRecord, index: number) => {
        const segP = extractLineFields(segPLines[index], bradescoCnab240.segmentoP!)
        const segQ = extractLineFields(segQLines[index], bradescoCnab240.segmentoQ!)

        // Verificar que campos principais foram extraídos sem erro
        expect(segP.valor_titulo.error).toBeFalsy()
        expect(segP.vencimento_titulo.error).toBeFalsy()
        expect(segQ.sacado_nome.error).toBeFalsy()
        expect(segQ.sacado_inscricao_numero.error).toBeFalsy()

        // Verificar valores extraídos
        expect(segP.valor_titulo.value).toBe(expected.amount)
        expect(segP.vencimento_titulo.raw).toBe(expected.dueDateRaw)
        expect(segQ.sacado_nome.value).toMatch(new RegExp(expected.name))
        expect(segQ.sacado_inscricao_numero.raw).toBe(expected.documentRaw)
      })
    })
  })
})

