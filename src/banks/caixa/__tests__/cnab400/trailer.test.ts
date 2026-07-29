/**
 * Testes do Trailer - Caixa CNAB 400
 * 
 * Valida a estrutura e campos do Trailer de Arquivo (tipo registro 9).
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Valores padrão
 * - Campos obrigatórios
 *
 * Posições validadas conforme manual oficial Caixa CNAB 400 (caixa_layout_CNAB_400_2024.pdf).
 */

import { caixaCnab400 } from '@banks/caixa/schemas/cnab400'

describe('Schema Caixa CNAB 400 - Trailer', () => {
  describe('Definição dos campos', () => {
    test('deve ter tipo de registro "9" (trailer) na posição 1', () => {
      const field = caixaCnab400.trailer!.codigo_registro
      
      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('9')
      expect(field.required).toBe(true)
    })

    test('deve ter uso exclusivo/brancos na posição 2-394', () => {
      const field = caixaCnab400.trailer!.uso_exclusivo
      
      expect(field.pos).toEqual([2, 394])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(393)
      expect(field.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = caixaCnab400.trailer!.numero_sequencial
      
      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })
})
