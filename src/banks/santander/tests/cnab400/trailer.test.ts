/**
 * Testes do Schema Santander CNAB 400 - Trailer
 *
 * Parte 1: Definição dos campos (sem fixture)
 * Parte 2: Parsing de arquivo real
 */

import { santanderCnab400 } from '@banks/santander/schemas/cnab400'
import { extractLineFields } from '@parser/field-extractor'
import { readFixture } from './shared'

describe('Schema Santander CNAB 400 - Trailer', () => {
  describe('Definição dos campos', () => {
    const trailer = santanderCnab400.trailer!

    test('deve ter tipo de registro "9" (trailer) na posição 1', () => {
      expect(trailer.tipo_registro).toBeDefined()
      expect(trailer.tipo_registro.pos).toEqual([1, 1])
      expect(trailer.tipo_registro.type).toBe('num')
      expect(trailer.tipo_registro.size).toBe(1)
      expect(trailer.tipo_registro.pattern).toBe('9')
    })

    test('deve ter quantidade de documentos na posição 2-7', () => {
      expect(trailer.qtd_documentos).toBeDefined()
      expect(trailer.qtd_documentos.pos).toEqual([2, 7])
      expect(trailer.qtd_documentos.type).toBe('num')
      expect(trailer.qtd_documentos.size).toBe(6)
    })

    test('deve ter valor total na posição 8-20 com 2 decimais', () => {
      expect(trailer.valor_total).toBeDefined()
      expect(trailer.valor_total.pos).toEqual([8, 20])
      expect(trailer.valor_total.type).toBe('num')
      expect(trailer.valor_total.size).toBe(13)
      expect(trailer.valor_total.decimals).toBe(2)
    })

    test('deve ter zeros na posição 21-394', () => {
      expect(trailer.zeros).toBeDefined()
      expect(trailer.zeros.pos).toEqual([21, 394])
      expect(trailer.zeros.type).toBe('num')
      expect(trailer.zeros.size).toBe(374)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(trailer.numero_sequencial).toBeDefined()
      expect(trailer.numero_sequencial.pos).toEqual([395, 400])
      expect(trailer.numero_sequencial.type).toBe('num')
      expect(trailer.numero_sequencial.size).toBe(6)
      expect(trailer.numero_sequencial.required).toBe(true)
    })
  })

  describe('Parsing de arquivo real', () => {
    const lines = readFixture('SANTANDER_cnab_400_140.REM')
    const trailerLine = lines[lines.length - 1]
    const detailLines = lines.filter((line) => line[0] === '1')

    test('deve extrair tipo de registro "9" (trailer)', () => {
      const trailer = extractLineFields(trailerLine, santanderCnab400.trailer!)
      expect(trailer.tipo_registro.raw).toBe('9')
    })

    test('qtd_documentos deve ser 128 (total de detalhes no arquivo)', () => {
      const trailer = extractLineFields(trailerLine, santanderCnab400.trailer!)
      
      // Evidência estrutural: deve bater com a contagem real de linhas de detalhe
      expect(trailer.qtd_documentos.value).toBe(detailLines.length)
      expect(trailer.qtd_documentos.value).toBe(128)
    })

    test('valor_total deve bater com a soma dos valores dos títulos', () => {
      const trailer = extractLineFields(trailerLine, santanderCnab400.trailer!)
      
      // Calcular soma manual dos detalhes
      const somaEsperada = detailLines.reduce((sum, line) => {
        const detail = extractLineFields(line, santanderCnab400.detail!)
        return sum + (Number(detail.valor_titulo.value) || 0)
      }, 0)

      const valorTrailer = Number(trailer.valor_total.value) || 0
      
      // Usar toBeCloseTo para tolerar arredondamentos
      expect(valorTrailer).toBeCloseTo(somaEsperada, 2)
    })

    test('numero_sequencial deve ser exatamente igual ao total de linhas do arquivo (evidência estrutural)', () => {
      const trailer = extractLineFields(trailerLine, santanderCnab400.trailer!)
      
      // Trailer é sempre a última linha, numero_sequencial deve ser igual ao total de linhas
      expect(trailer.numero_sequencial.value).toBe(lines.length)
      expect(trailer.numero_sequencial.value).toBe(130)
    })
  })
})

