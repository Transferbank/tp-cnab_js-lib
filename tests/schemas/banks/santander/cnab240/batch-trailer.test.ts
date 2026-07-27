/**
 * Testes do Trailer de Lote REMESSA - Santander CNAB 240
 * 
 * Versão simplificada para REMESSA conforme Manual H7815 v6 (Fevereiro/2023).
 * Diferente da versão rica de RETORNO que tinha antes.
 */

import { santanderCnab240 } from '../../../../../src/banks/santander/schemas/cnab240'

describe('Schema Santander CNAB 240 - Trailer de Lote (REMESSA)', () => {
  describe('Definição dos campos - Manual 2023 (REMESSA)', () => {
    test('deve ter código do banco na posição 1-3 com padrão "033"', () => {
      const field = santanderCnab240.trailerLote!.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('033')
    })

    test('deve ter tipo de registro "5" (trailer de lote) na posição 8', () => {
      const field = santanderCnab240.trailerLote!.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('5')
    })

    test('deve ter quantidade de registros na posição 18-23', () => {
      const field = santanderCnab240.trailerLote!.totais_quantidade_registros
      
      expect(field.pos).toEqual([18, 23])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })

    test('deve ter campo reservado grande (pos 24-240) - versão REMESSA simplificada', () => {
      const field = santanderCnab240.trailerLote!.cnab_exclusivo_2
      
      expect(field.pos).toEqual([24, 240])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(217)
      expect(field.required).toBe(false)
    })

    test('NÃO deve ter campos detalhados de totalizadores (versão RETORNO)', () => {
      // Versão antiga (RETORNO) tinha estes campos - versão REMESSA não tem
      expect(santanderCnab240.trailerLote!.totais_quantidade_titulos).toBeUndefined()
      expect(santanderCnab240.trailerLote!.totais_valor_titulos).toBeUndefined()
      expect(santanderCnab240.trailerLote!.totais_quantidade_titulos_vinculados).toBeUndefined()
      expect(santanderCnab240.trailerLote!.totais_valor_titulos_vinculados).toBeUndefined()
      expect(santanderCnab240.trailerLote!.totais_quantidade_titulos_caucionados).toBeUndefined()
      expect(santanderCnab240.trailerLote!.totais_valor_titulos_caucionados).toBeUndefined()
      expect(santanderCnab240.trailerLote!.aviso_bancario).toBeUndefined()
    })

    test('deve ter 6 campos no total (versão REMESSA simplificada)', () => {
      const campos = Object.keys(santanderCnab240.trailerLote!)
      expect(campos.length).toBe(6)
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      for (const field of Object.values(santanderCnab240.trailerLote!)) {
        expect(field.pos).toBeDefined()
        expect(field.type).toBeDefined()
        expect(field.size).toBeGreaterThan(0)
      }
    })

    test('tamanhos declarados devem bater com as posições', () => {
      for (const field of Object.values(santanderCnab240.trailerLote!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('não deve haver sobreposição de posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(santanderCnab240.trailerLote!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('deve cobrir todas as 240 posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(santanderCnab240.trailerLote!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          positions.add(i)
        }
      }
      
      expect(positions.size).toBe(240)
    })
  })
})
