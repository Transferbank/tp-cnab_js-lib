/**
 * Testes do Header de Lote - Santander CNAB 240
 * 
 * Atualizado conforme Manual H7815 v6 (Fevereiro/2023).
 */

import { santanderCnab240 } from '../../../../../src/banks/santander/schemas/cnab240'

describe('Schema Santander CNAB 240 - Header de Lote', () => {
  describe('Definição dos campos - Manual 2023', () => {
    test('deve ter código do banco na posição 1-3 com padrão "033"', () => {
      const field = santanderCnab240.headerLote!.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('033')
    })

    test('deve ter tipo de registro "1" (header de lote) na posição 8', () => {
      const field = santanderCnab240.headerLote!.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('1')
    })

    test('deve ter servico_forma como Reservado (pos 12-13) - Manual 2023', () => {
      const field = santanderCnab240.headerLote!.servico_forma
      
      expect(field.pos).toEqual([12, 13])
      expect(field.type).toBe('alfa') // Corrigido de 'num'
      expect(field.required).toBe(false)
      expect(field.description).toContain('Reservado')
      expect(field.description).toContain('Manual 2023')
    })

    test('deve ter versão do layout "030" (não 040) na posição 14-16 - Manual 2023', () => {
      const field = santanderCnab240.headerLote!.servico_layout
      
      expect(field.pos).toEqual([14, 16])
      expect(field.pattern).toBe('030') // Corrigido de '040'
      expect(field.description).toContain('Manual 2023')
    })

    test('deve ter código de transmissão NUMÉRICO (não alfa) na posição 54-68 - Manual 2023', () => {
      const field = santanderCnab240.headerLote!.codigo_transmissao
      
      expect(field.pos).toEqual([54, 68])
      expect(field.type).toBe('num') // Corrigido de 'alfa'
      expect(field.size).toBe(15)
    })

    test('deve ter 19 campos definidos no total', () => {
      const campos = Object.keys(santanderCnab240.headerLote!)
      expect(campos.length).toBe(19)
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      for (const field of Object.values(santanderCnab240.headerLote!)) {
        expect(field.pos).toBeDefined()
        expect(field.type).toBeDefined()
        expect(field.size).toBeGreaterThan(0)
      }
    })

    test('tamanhos declarados devem bater com as posições', () => {
      for (const field of Object.values(santanderCnab240.headerLote!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('não deve haver sobreposição de posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(santanderCnab240.headerLote!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('deve cobrir todas as 240 posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(santanderCnab240.headerLote!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          positions.add(i)
        }
      }
      
      expect(positions.size).toBe(240)
    })
  })
})
