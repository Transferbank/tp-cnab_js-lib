/**
 * Testes do Helper do Segmento S - Bradesco CNAB 240
 * 
 * Valida as funções auxiliares (helper) que identificam variantes e extraem
 * informações do Segmento S (mensagens para impressão no boleto).
 * 
 * O Segmento S possui duas variantes:
 * - Variante A (tipo 1 ou 2): mensagem livre de 140 caracteres
 * - Variante B (tipo 3): cinco blocos de 40 caracteres
 */

import {
  identifySegmentSVariant,
  parseSegmentS,
  extractSegmentSMessages,
  isSegmentS,
  SegmentSPrintType,
} from '@banks/bradesco/schemas/cnab240'

describe('Helper Bradesco CNAB 240 - Segmento S', () => {
  describe('isSegmentS', () => {
    test('deve retornar true para Segmento S válido', () => {
      const line = '2370001300001S 01MENSAGEM'.padEnd(240, ' ')
      expect(isSegmentS(line)).toBe(true)
    })

    test('deve retornar false para linha com tamanho inválido', () => {
      const line = '2370001300001S 01MENSAGEM'
      expect(isSegmentS(line)).toBe(false)
    })

    test('deve retornar false para tipo de registro incorreto', () => {
      const line = '2370001000001S 01MENSAGEM'.padEnd(240, ' ')
      expect(isSegmentS(line)).toBe(false)
    })

    test('deve retornar false para segmento incorreto', () => {
      const line = '2370001300001P 01MENSAGEM'.padEnd(240, ' ')
      expect(isSegmentS(line)).toBe(false)
    })
  })

  describe('identifySegmentSVariant', () => {
    test('deve identificar variante A para tipo de impressão 1', () => {
      const prefix = '2370001300001S 011'
      const line = prefix.padEnd(240, ' ')
      const variant = identifySegmentSVariant(line)
      
      expect(variant.isValid).toBe(true)
      expect(variant.variante).toBe('A')
      expect(variant.tipoImpressao).toBe(SegmentSPrintType.MENSAGEM_LIVRE_TIPO_1)
      expect(variant.description).toContain('Mensagem livre')
    })

    test('deve identificar variante A para tipo de impressão 2', () => {
      const prefix = '2370001300001S 012'
      const line = prefix.padEnd(240, ' ')
      const variant = identifySegmentSVariant(line)
      
      expect(variant.isValid).toBe(true)
      expect(variant.variante).toBe('A')
      expect(variant.tipoImpressao).toBe(SegmentSPrintType.MENSAGEM_LIVRE_TIPO_2)
    })

    test('deve identificar variante B para tipo de impressão 3', () => {
      const prefix = '2370001300001S 013'
      const line = prefix.padEnd(240, ' ')
      const variant = identifySegmentSVariant(line)
      
      expect(variant.isValid).toBe(true)
      expect(variant.variante).toBe('B')
      expect(variant.tipoImpressao).toBe(SegmentSPrintType.BLOCOS_INFORMACAO)
      expect(variant.description).toContain('Blocos de informação')
    })

    test('deve retornar erro para linha com tamanho inválido', () => {
      const line = '2370001300001S 01'
      const variant = identifySegmentSVariant(line)
      
      expect(variant.isValid).toBe(false)
      expect(variant.error).toContain('240 caracteres')
    })

    test('deve retornar erro para tipo de registro incorreto', () => {
      const line = '2370001000001S 01MENSAGEM'.padEnd(240, ' ')
      const variant = identifySegmentSVariant(line)
      
      expect(variant.isValid).toBe(false)
      expect(variant.error).toContain('tipo 3')
    })

    test('deve retornar erro para segmento incorreto', () => {
      const line = '2370001300001P 01MENSAGEM'.padEnd(240, ' ')
      const variant = identifySegmentSVariant(line)
      
      expect(variant.isValid).toBe(false)
      expect(variant.error).toContain('segmento S')
    })

    test('deve retornar erro para tipo de impressão inválido', () => {
      const line = '2370001300001S 09MENSAGEM'.padEnd(240, ' ')
      const variant = identifySegmentSVariant(line)
      
      expect(variant.isValid).toBe(false)
      expect(variant.error).toContain('Tipo de impressão inválido')
    })
  })

  describe('parseSegmentS', () => {
    test('deve parsear variante A corretamente', () => {
      const prefix = '2370001300001S 012' // tipo 2, número linha 12
      const line = prefix.padEnd(240, ' ')
      const result = parseSegmentS(line)
      
      expect(result.variant.isValid).toBe(true)
      expect(result.variant.variante).toBe('A')
      expect(result.fields.numero_linha).toBeDefined()
    })

    test('deve parsear variante B corretamente', () => {
      const prefix = '2370001300001S 013' // tipo 3 = blocos de informação
      const line = prefix.padEnd(240, ' ')
      const result = parseSegmentS(line)
      
      expect(result.variant.isValid).toBe(true)
      expect(result.variant.variante).toBe('B')
      expect(result.fields.informacao_5).toBeDefined()
    })
  })

  describe('extractSegmentSMessages', () => {
    test('deve extrair mensagem da variante A', () => {
      const prefix = '2370001300001S 011'
      const line = prefix.padEnd(240, ' ')
      const messages = extractSegmentSMessages(line)
      
      // Linha válida mas sem mensagem (apenas espaços)
      expect(messages).toEqual([])
    })

    test('deve extrair mensagens da variante B', () => {
      const info5 = 'INFO 5'
      const info6 = 'INFO 6'
      const info7 = 'INFO 7'
      const prefix = '2370001300001S 013'
      const content = info5.padEnd(40, ' ') + info6.padEnd(40, ' ') + info7.padEnd(40, ' ')
      const line = (prefix + content).padEnd(240, ' ')
      const messages = extractSegmentSMessages(line)
      
      expect(messages.length).toBeGreaterThanOrEqual(3)
      expect(messages[0]).toBe(info5)
      expect(messages[1]).toBe(info6)
      expect(messages[2]).toBe(info7)
    })

    test('deve retornar array vazio para linha inválida', () => {
      const line = 'linha invalida'
      const messages = extractSegmentSMessages(line)
      
      expect(messages).toEqual([])
    })

    test('deve ignorar mensagens vazias na variante B', () => {
      const info5 = 'INFO 5'
      const prefix = '2370001300001S 013'
      const content = info5.padEnd(40, ' ') + ''.padEnd(40, ' ') + ''.padEnd(40, ' ')
      const line = (prefix + content).padEnd(240, ' ')
      const messages = extractSegmentSMessages(line)
      
      expect(messages).toHaveLength(1)
      expect(messages[0]).toBe(info5)
    })
  })
})

