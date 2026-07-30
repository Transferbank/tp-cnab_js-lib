/**
 * Testes do Schema Segmento S - Bradesco CNAB 240
 * 
 * Valida a estrutura e campos dos schemas do Segmento S (mensagens para impressão no boleto).
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Tamanhos e estrutura dos schemas
 * 
 * O Segmento S possui duas variantes:
 * - Variante A (tipo 1 ou 2): mensagem livre de 140 caracteres
 * - Variante B (tipo 3): cinco blocos de 40 caracteres
 * 
 * Os testes do helper (funções auxiliares) estão em segment-s-helper.test.ts
 */

import {
  BRADESCO_CNAB240_SEGMENT_S_BASE,
  BRADESCO_CNAB240_SEGMENT_S_MESSAGE,
  BRADESCO_CNAB240_SEGMENT_S_INFO,
} from '@banks/bradesco/schemas/cnab240'

describe('Schema Bradesco CNAB 240 - Segmento S', () => {
  describe('Schema Base (posições 1-18)', () => {
    test('deve ter código do banco na posição 1-3 com padrão "237"', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_BASE.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('237')
    })

    test('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_BASE.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('3')
    })

    test('deve ter identificador do segmento "S" na posição 14', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_BASE.servico_segmento
      
      expect(field.pos).toEqual([14, 14])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('S')
    })

    test('deve ter tipo de impressão na posição 18', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_BASE.tipo_impressao
      
      expect(field.pos).toEqual([18, 18])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter 8 campos no schema base', () => {
      const campos = Object.keys(BRADESCO_CNAB240_SEGMENT_S_BASE)
      expect(campos.length).toBe(8)
    })
  })

  describe('Variante A - Mensagem Livre', () => {
    test('deve ter todos os campos da variante A', () => {
      expect(BRADESCO_CNAB240_SEGMENT_S_MESSAGE.numero_linha).toBeDefined()
      expect(BRADESCO_CNAB240_SEGMENT_S_MESSAGE.mensagem).toBeDefined()
      expect(BRADESCO_CNAB240_SEGMENT_S_MESSAGE.tipo_fonte).toBeDefined()
    })

    test('deve ter número da linha na posição 19-20', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_MESSAGE.numero_linha
      
      expect(field.pos).toEqual([19, 20])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
    })

    test('deve ter mensagem na posição 21-160', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_MESSAGE.mensagem
      
      expect(field.pos).toEqual([21, 160])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(140)
      expect(field.required).toBe(true)
    })

    test('deve ter tipo de fonte na posição 161-162', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_MESSAGE.tipo_fonte
      
      expect(field.pos).toEqual([161, 162])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
    })

    test('deve ter campo CNAB na posição 163-240 (78 caracteres)', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_MESSAGE.cnab_exclusivo_2
      
      expect(field.pos).toEqual([163, 240])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(78)
    })

    test('deve ter 12 campos no total (8 base + 4 variante A)', () => {
      const campos = Object.keys(BRADESCO_CNAB240_SEGMENT_S_MESSAGE)
      expect(campos.length).toBe(12)
    })
  })

  describe('Variante B - Blocos de Informação', () => {
    test('deve ter todos os campos da variante B', () => {
      expect(BRADESCO_CNAB240_SEGMENT_S_INFO.informacao_5).toBeDefined()
      expect(BRADESCO_CNAB240_SEGMENT_S_INFO.informacao_6).toBeDefined()
      expect(BRADESCO_CNAB240_SEGMENT_S_INFO.informacao_7).toBeDefined()
      expect(BRADESCO_CNAB240_SEGMENT_S_INFO.informacao_8).toBeDefined()
      expect(BRADESCO_CNAB240_SEGMENT_S_INFO.informacao_9).toBeDefined()
    })

    test('deve ter informação 5 na posição 19-58', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_INFO.informacao_5
      
      expect(field.pos).toEqual([19, 58])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
    })

    test('deve ter informação 6 na posição 59-98', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_INFO.informacao_6
      
      expect(field.pos).toEqual([59, 98])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
    })

    test('deve ter informação 7 na posição 99-138', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_INFO.informacao_7
      
      expect(field.pos).toEqual([99, 138])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
    })

    test('deve ter informação 8 na posição 139-178', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_INFO.informacao_8
      
      expect(field.pos).toEqual([139, 178])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
    })

    test('deve ter informação 9 na posição 179-218', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_INFO.informacao_9
      
      expect(field.pos).toEqual([179, 218])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
    })

    test('deve ter campo CNAB na posição 219-240 (22 caracteres)', () => {
      const field = BRADESCO_CNAB240_SEGMENT_S_INFO.cnab_exclusivo_2
      
      expect(field.pos).toEqual([219, 240])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(22)
    })

    test('deve ter 14 campos no total (8 base + 6 variante B)', () => {
      const campos = Object.keys(BRADESCO_CNAB240_SEGMENT_S_INFO)
      expect(campos.length).toBe(14)
    })
  })
})


