/**
 * Testes de Integra��o - Bradesco CNAB 240
 * 
 * Valida o parsing completo de arquivos CNAB reais com m�ltiplos t�tulos.
 * Testa a estrutura geral do arquivo e extra��o de todos os campos principais.
 */

import { bradescoCnab240 } from '@banks/bradesco/schemas/cnab240'
import { extractLineFields } from '@parser/field-extractor'
import { loadFixtureMetadata } from '../../../../../tests/helpers/fixture-metadata'
import { readFixture, findSegmentLines } from './shared'
import { CNABFormatCode } from '@tp-types/index'

describe('Schema Bradesco CNAB 240 - Integra��o (Parsing Completo)', () => {
  let lines: string[]
  let metadata: any

  beforeAll(() => {
    lines = readFixture('remessa-multipla.txt')
    metadata = loadFixtureMetadata('bradesco', 'remessa-multipla', CNABFormatCode.CNAB240)
  })

  describe('Estrutura do arquivo', () => {
    test('deve ter n�mero correto de linhas (do JSON)', () => {
      expect(lines).toHaveLength(metadata.structure.totalLines)
    })

    test('deve ter 240 caracteres em cada linha', () => {
      lines.forEach((line: any) => {
        expect(line.length).toBe(240)
      })
    })

    test('deve parsear todos os campos sem erros de extra��o', () => {
      // Header de Arquivo
      const headerArquivo = extractLineFields(lines[0], bradescoCnab240.headerArquivo!)
      expect(headerArquivo.controle_banco.error).toBeFalsy()
      expect(headerArquivo.cedente_nome.error).toBeFalsy()
      expect(headerArquivo.arquivo_data_de_geracao.error).toBeFalsy()

      // Segmentos P e Q s�o localizados pelo conte�do (pos 8 = '3', pos 14 = letra do
      // segmento), n�o por �ndice fixo, j� que o arquivo tamb�m tem Header de Lote e
      // Segmentos R/S entre os t�tulos.
      const segPLines = findSegmentLines(lines, 'P')
      const segQLines = findSegmentLines(lines, 'Q')

      segPLines.forEach((line: any) => {
        const segP = extractLineFields(line, bradescoCnab240.segmentoP!)
        expect(segP.controle_banco.error).toBeFalsy()
        expect(segP.valor_titulo.error).toBeFalsy()
        expect(segP.vencimento_titulo.error).toBeFalsy()
      })

      segQLines.forEach((line: any) => {
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
    test('deve parsear quantidade correta de t�tulos (do JSON)', () => {
      // Contagem de segmentos P (cada t�tulo tem um segmento P), identificados pelo
      // conte�do da linha (pos 8 = '3', pos 14 = 'P')
      const segmentosP = findSegmentLines(lines, 'P')

      expect(segmentosP.length).toBe(metadata.records.length)
    })
  })

  describe('Extra��o de todos os campos principais', () => {
    test('deve extrair todos os campos principais de todos os t�tulos', () => {
      expect(metadata.records.length).toBeGreaterThan(0)

      const segPLines = findSegmentLines(lines, 'P')
      const segQLines = findSegmentLines(lines, 'Q')

      metadata.records.forEach((expected: any, index: any) => {
        const segP = extractLineFields(segPLines[index], bradescoCnab240.segmentoP!)
        const segQ = extractLineFields(segQLines[index], bradescoCnab240.segmentoQ!)

        // Verificar que campos principais foram extra�dos sem erro
        expect(segP.valor_titulo.error).toBeFalsy()
        expect(segP.vencimento_titulo.error).toBeFalsy()
        expect(segQ.sacado_nome.error).toBeFalsy()
        expect(segQ.sacado_inscricao_numero.error).toBeFalsy()

        // Verificar valores extra�dos
        expect(segP.valor_titulo.value).toBe(expected.amount)
        expect(segP.vencimento_titulo.raw).toBe(expected.dueDateRaw)
        expect(segQ.sacado_nome.value).toMatch(new RegExp(expected.name))
        expect(segQ.sacado_inscricao_numero.raw).toBe(expected.documentRaw)
      })
    })
  })
})
