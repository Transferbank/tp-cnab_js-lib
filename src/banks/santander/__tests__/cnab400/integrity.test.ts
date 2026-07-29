/**
 * Testes de integridade do Schema Santander CNAB 400
 *
 * Verifica:
 * - Sem sobreposição de posições
 * - Tamanho declarado bate com posições
 */

import { santanderCnab400 } from '@banks/santander/schemas/cnab400'

describe('Schema Santander CNAB 400 - Integridade', () => {
  describe('Header de Arquivo', () => {
    const header = santanderCnab400.header!

    test('não deve ter sobreposição de posições', () => {
      const fields = Object.entries(header).sort((a, b) => a[1].pos[0] - b[1].pos[0])

      for (let i = 0; i < fields.length - 1; i++) {
        const [, fieldA] = fields[i]
        const [, fieldB] = fields[i + 1]

        const endA = fieldA.pos[1]
        const startB = fieldB.pos[0]

        expect(endA).toBeLessThan(startB)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      Object.entries(header).forEach(([, field]) => {
        const tamanhoCalculado = field.pos[1] - field.pos[0] + 1
        expect(field.size).toBe(tamanhoCalculado)
      })
    })
  })

  describe('Detail', () => {
    const detail = santanderCnab400.detail!

    test('não deve ter sobreposição de posições', () => {
      const fields = Object.entries(detail).sort((a, b) => a[1].pos[0] - b[1].pos[0])

      for (let i = 0; i < fields.length - 1; i++) {
        const [, fieldA] = fields[i]
        const [, fieldB] = fields[i + 1]

        const endA = fieldA.pos[1]
        const startB = fieldB.pos[0]

        expect(endA).toBeLessThan(startB)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      Object.entries(detail).forEach(([, field]) => {
        const tamanhoCalculado = field.pos[1] - field.pos[0] + 1
        expect(field.size).toBe(tamanhoCalculado)
      })
    })
  })

  describe('Trailer', () => {
    const trailer = santanderCnab400.trailer!

    test('não deve ter sobreposição de posições', () => {
      const fields = Object.entries(trailer).sort((a, b) => a[1].pos[0] - b[1].pos[0])

      for (let i = 0; i < fields.length - 1; i++) {
        const [, fieldA] = fields[i]
        const [, fieldB] = fields[i + 1]

        const endA = fieldA.pos[1]
        const startB = fieldB.pos[0]

        expect(endA).toBeLessThan(startB)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      Object.entries(trailer).forEach(([, field]) => {
        const tamanhoCalculado = field.pos[1] - field.pos[0] + 1
        expect(field.size).toBe(tamanhoCalculado)
      })
    })
  })
})
