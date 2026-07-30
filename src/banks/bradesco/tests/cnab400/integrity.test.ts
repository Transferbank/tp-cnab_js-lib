/**
 * Testes de Integridade - Bradesco CNAB 400
 * 
 * Valida a integridade dos schemas: sem sobreposições, tamanhos corretos.
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Validação de posições
 * - Consistência de tamanhos
 * - Ausência de sobreposições
 */

import { bradescoCnab400 } from '@banks/bradesco/schemas/cnab400'

describe('Schema Bradesco CNAB 400 - Integridade', () => {
  describe('Header de Arquivo', () => {
    test('não deve ter sobreposição de posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(bradescoCnab400.header!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      for (const field of Object.values(bradescoCnab400.header!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })
  })

  describe('Detail', () => {
    test('não deve ter sobreposição de posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(bradescoCnab400.detail!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      for (const field of Object.values(bradescoCnab400.detail!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })
  })

  describe('Trailer', () => {
    test('não deve ter sobreposição de posições', () => {
      const positions = new Set<number>()
      
      for (const field of Object.values(bradescoCnab400.trailer!)) {
        const [start, end] = field.pos
        for (let i = start; i <= end; i++) {
          expect(positions.has(i)).toBe(false)
          positions.add(i)
        }
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      for (const field of Object.values(bradescoCnab400.trailer!)) {
        const [start, end] = field.pos
        const calculatedSize = end - start + 1
        expect(field.size).toBe(calculatedSize)
      }
    })
  })
})

