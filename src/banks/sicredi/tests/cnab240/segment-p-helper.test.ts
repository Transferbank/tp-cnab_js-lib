/**
 * Testes do Helper Segmento P - Sicredi CNAB 240
 *
 * Valida a função auxiliar que resolve o campo condicional valor_titulo
 * (2 decimais para moeda corrente, 5 para moeda variável).
 */

import { resolveTitleAmount, resolveTitleAmountSegmentP } from '@banks/sicredi/schemas/cnab240/segment-p-helper'
import type { ParsedLine } from '@tp-types/core'

describe('Helper Sicredi CNAB 240 - Segmento P', () => {
  describe('resolveTitleAmount - função base', () => {
    test('deve calcular valor monetário com 2 decimais quando moeda = "09" (Real)', () => {
      // 36812 com 2 decimais = 368.12
      const result = resolveTitleAmount('000000000036812', '09')
      expect(result).toBe(368.12)
    })

    test('deve calcular valor com 5 decimais quando moeda != "09" (moeda variável)', () => {
      // 1234567 com 5 decimais = 12.34567
      const result = resolveTitleAmount('000000001234567', '05')
      expect(result).toBe(12.34567)
    })

    test('deve tratar zeros corretamente', () => {
      expect(resolveTitleAmount('000000000000000', '09')).toBe(0)
      expect(resolveTitleAmount('000000000000000', '05')).toBe(0)
    })

    test('deve tratar string vazia como zero', () => {
      expect(resolveTitleAmount('', '09')).toBe(0)
    })

    test('deve calcular valor grande corretamente (2 decimais)', () => {
      // 999999999999999 com 2 decimais = 9999999999999.99
      const result = resolveTitleAmount('999999999999999', '09')
      expect(result).toBe(9999999999999.99)
    })
  })

  describe('resolveTitleAmountSegmentP - wrapper para valor_titulo', () => {
    test('deve resolver valor com 2 decimais quando moeda_codigo = "09"', () => {
      const fields: ParsedLine = {
        valor_titulo: { value: 368.12, raw: '000000000036812', error: null, canonical: null },
        moeda_codigo: { value: 9, raw: '09', error: null, canonical: null },
      }

      expect(resolveTitleAmountSegmentP(fields)).toBe(368.12)
    })

    test('deve resolver valor com 5 decimais quando moeda_codigo != "09"', () => {
      const fields: ParsedLine = {
        // valor parseado com decimals:2 pelo FieldDefinition seria 12345.67 (incorreto)
        valor_titulo: { value: 12345.67, raw: '000000001234567', error: null, canonical: null },
        moeda_codigo: { value: 5, raw: '05', error: null, canonical: null },
      }

      expect(resolveTitleAmountSegmentP(fields)).toBe(12.34567) // corrigido para 5 decimais
    })

    test('deve assumir moeda corrente (2 decimais) quando moeda_codigo não está presente', () => {
      const fields: ParsedLine = {
        valor_titulo: { value: 368.12, raw: '000000000036812', error: null, canonical: null },
      }

      expect(resolveTitleAmountSegmentP(fields)).toBe(368.12)
    })
  })
})


