/**
 * Testes do Header de Arquivo - Santander CNAB 240
 * 
 * Atualizado conforme Manual H7815 v6 (Fevereiro/2023).
 */

import { santanderCnab240 } from '@banks/santander/schemas/cnab240'

describe('Schema Santander CNAB 240 - Header de Arquivo', () => {
  describe('Definição dos campos - Manual 2023', () => {
    test('deve ter código do banco na posição 1-3 com padrão "033"', () => {
      const field = santanderCnab240.headerArquivo!.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('033')
    })

    test('deve ter lote "0000" na posição 4-7', () => {
      const field = santanderCnab240.headerArquivo!.controle_lote
      
      expect(field.pos).toEqual([4, 7])
      expect(field.pattern).toBe('0000')
    })

    test('deve ter tipo de registro "0" (header) na posição 8', () => {
      const field = santanderCnab240.headerArquivo!.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('0')
    })

    test('deve ter código de transmissão NUMÉRICO (não alfa) na posição 33-47 - Manual 2023', () => {
      const field = santanderCnab240.headerArquivo!.codigo_transmissao
      
      expect(field.pos).toEqual([33, 47])
      expect(field.type).toBe('num') // Corrigido de 'alfa' para 'num'
      expect(field.size).toBe(15)
    })

    test('deve ter versão do layout "040" na posição 164-166', () => {
      const field = santanderCnab240.headerArquivo!.arquivo_layout

      expect(field.pos).toEqual([164, 166])
      expect(field.pattern).toBe('040')
    })

    test('deve ter bloco único reservado de 74 bytes na posição 167-240 (não subdividido)', () => {
      const field = santanderCnab240.headerArquivo!.cnab_exclusivo_5

      expect(field.pos).toEqual([167, 240])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(74)
      expect(field.required).toBe(false)

      // Não deve mais existir como campos separados (densidade/reservado_banco/reservado_empresa)
      expect(santanderCnab240.headerArquivo!.arquivo_densidade).toBeUndefined()
      expect(santanderCnab240.headerArquivo!.reservado_banco).toBeUndefined()
      expect(santanderCnab240.headerArquivo!.reservado_empresa).toBeUndefined()
    })

    test('deve ter 17 campos definidos no total', () => {
      const campos = Object.keys(santanderCnab240.headerArquivo!)
      expect(campos.length).toBe(17)
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      for (const field of Object.values(santanderCnab240.headerArquivo!)) {
        expect(field.pos).toBeDefined()
        expect(field.type).toBeDefined()
        expect(field.size).toBeGreaterThan(0)
      }
    })

    test('tamanhos declarados devem bater com as posições', () => {
      for (const field of Object.values(santanderCnab240.headerArquivo!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })

    test('não deve haver sobreposição de posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(santanderCnab240.headerArquivo!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('deve cobrir todas as 240 posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(santanderCnab240.headerArquivo!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          positions.add(i)
        }
      }
      
      expect(positions.size).toBe(240)
    })
  })
})
