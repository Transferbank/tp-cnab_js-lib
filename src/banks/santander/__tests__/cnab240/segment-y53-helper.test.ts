/**
 * Testes do Helper Segmento Y-53 - Santander CNAB 240
 * 
 * Valida as funções auxiliares para resolver campos condicionais
 * (valor_maximo e valor_minimo com precisão decimal variável).
 */

import {
  resolveY53Amount,
  resolveMaxAmount,
  resolveMinAmount,
} from '@banks/santander/schemas/cnab240/segmentos-opcionais/segment-y53-helper'
import type { ParsedLine } from '@tp-types/core'

describe('Helper Santander CNAB 240 - Segmento Y-53', () => {
  describe('resolveY53Amount - função base', () => {
    test('deve calcular percentual com 5 decimais quando tipo = "1"', () => {
      // 1234567 com 5 decimais = 12.34567
      const result = resolveY53Amount('000000001234567', '1')
      expect(result).toBe(12.34567)
    })

    test('deve calcular valor monetário com 2 decimais quando tipo = "2"', () => {
      // 1234567 com 2 decimais = 12345.67
      const result = resolveY53Amount('000000001234567', '2')
      expect(result).toBe(12345.67)
    })

    test('deve tratar zeros corretamente', () => {
      expect(resolveY53Amount('000000000000000', '1')).toBe(0)
      expect(resolveY53Amount('000000000000000', '2')).toBe(0)
    })

    test('deve tratar string vazia como zero', () => {
      expect(resolveY53Amount('', '1')).toBe(0)
      expect(resolveY53Amount('', '2')).toBe(0)
    })

    test('deve calcular percentual 100% corretamente (tipo 1)', () => {
      // 10000000 com 5 decimais = 100.00000
      const result = resolveY53Amount('000010000000000', '1')
      expect(result).toBe(100000)
    })

    test('deve calcular valor grande corretamente (tipo 2)', () => {
      // 999999999999999 com 2 decimais = 9999999999999.99
      const result = resolveY53Amount('999999999999999', '2')
      expect(result).toBe(9999999999999.99)
    })

    test('deve usar 2 decimais como padrão para tipo desconhecido', () => {
      // Quando tipo não é '1', assume valor monetário (2 decimais)
      const result = resolveY53Amount('000000001234567', '9')
      expect(result).toBe(12345.67)
    })
  })

  describe('resolveMaxAmount - wrapper para valor_maximo', () => {
    test('deve resolver valor máximo como percentual (tipo 1)', () => {
      const fields: ParsedLine = {
        valor_maximo_tipo: { value: 1, raw: '1', error: null, canonical: null },
        valor_maximo: { value: 12345.67, raw: '000000001234567', error: null, canonical: null }, // valor parseado com decimals:2 (incorreto)
      }

      const result = resolveMaxAmount(fields)
      expect(result).toBe(12.34567) // Corrigido para 5 decimais
    })

    test('deve resolver valor máximo como monetário (tipo 2)', () => {
      const fields: ParsedLine = {
        valor_maximo_tipo: { value: 2, raw: '2', error: null, canonical: null },
        valor_maximo: { value: 12345.67, raw: '000000001234567', error: null, canonical: null },
      }

      const result = resolveMaxAmount(fields)
      expect(result).toBe(12345.67) // 2 decimais, bate com o schema
    })
  })

  describe('resolveMinAmount - wrapper para valor_minimo', () => {
    test('deve resolver valor mínimo como percentual (tipo 1)', () => {
      const fields: ParsedLine = {
        valor_minimo_tipo: { value: 1, raw: '1', error: null, canonical: null },
        valor_minimo: { value: 50000, raw: '000000005000000', error: null, canonical: null },
      }

      const result = resolveMinAmount(fields)
      expect(result).toBe(50) // 5000000 com 5 decimais = 50.00000
    })

    test('deve resolver valor mínimo como monetário (tipo 2)', () => {
      const fields: ParsedLine = {
        valor_minimo_tipo: { value: 2, raw: '2', error: null, canonical: null },
        valor_minimo: { value: 100.50, raw: '000000000010050', error: null, canonical: null },
      }

      const result = resolveMinAmount(fields)
      expect(result).toBe(100.5) // 10050 com 2 decimais = 100.50
    })
  })

  describe('Casos de uso reais - Nota 48 do Manual', () => {
    test('Exemplo 1: Pagamento parcial entre 10% e 50%', () => {
      const fields: ParsedLine = {
        valor_maximo_tipo: { value: 1, raw: '1', error: null, canonical: null },
        valor_maximo: { value: 5000000, raw: '000000005000000', error: null, canonical: null }, // 50% com 5 decimais
        valor_minimo_tipo: { value: 1, raw: '1', error: null, canonical: null },
        valor_minimo: { value: 1000000, raw: '000000001000000', error: null, canonical: null }, // 10% com 5 decimais
      }

      expect(resolveMaxAmount(fields)).toBe(50)
      expect(resolveMinAmount(fields)).toBe(10)
    })

    test('Exemplo 2: Pagamento parcial entre R$ 50,00 e R$ 1.000,00', () => {
      const fields: ParsedLine = {
        valor_maximo_tipo: { value: 2, raw: '2', error: null, canonical: null },
        valor_maximo: { value: 100000, raw: '000000000100000', error: null, canonical: null }, // R$ 1000.00 com 2 decimais
        valor_minimo_tipo: { value: 2, raw: '2', error: null, canonical: null },
        valor_minimo: { value: 5000, raw: '000000000005000', error: null, canonical: null }, // R$ 50.00 com 2 decimais
      }

      expect(resolveMaxAmount(fields)).toBe(1000)
      expect(resolveMinAmount(fields)).toBe(50)
    })

    test('Exemplo 3: Mix percentual (max) e valor (min)', () => {
      const fields: ParsedLine = {
        valor_maximo_tipo: { value: 1, raw: '1', error: null, canonical: null },
        valor_maximo: { value: 7500000, raw: '000000007500000', error: null, canonical: null }, // 75% com 5 decimais
        valor_minimo_tipo: { value: 2, raw: '2', error: null, canonical: null },
        valor_minimo: { value: 10000, raw: '000000000010000', error: null, canonical: null }, // R$ 100.00 com 2 decimais
      }

      expect(resolveMaxAmount(fields)).toBe(75)
      expect(resolveMinAmount(fields)).toBe(100)
    })
  })
})

