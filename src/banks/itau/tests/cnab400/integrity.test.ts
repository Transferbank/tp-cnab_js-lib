/**
 * Testes de integridade do Schema Itaú CNAB 400
 *
 * Verifica:
 * - Sem sobreposição de posições
 * - Tamanho declarado bate com posições
 */

import { itauCnab400 } from '@banks/itau/schemas/cnab400'
import { TYPE2_FINE } from '@banks/itau/schemas/cnab400/registros-opcionais/type2-fine/type2-fine'

describe('Schema Itaú CNAB 400 - Integridade', () => {
  describe('Header de Arquivo', () => {
    const header = itauCnab400.header!

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
    const detail = itauCnab400.detail!

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
    const trailer = itauCnab400.trailer!

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

  describe('Registro Tipo 2 (Complemento de Multa)', () => {
    test('não deve ter sobreposição de posições', () => {
      const fields = Object.entries(TYPE2_FINE).sort((a, b) => a[1].pos[0] - b[1].pos[0])

      for (let i = 0; i < fields.length - 1; i++) {
        const [, fieldA] = fields[i]
        const [, fieldB] = fields[i + 1]

        const endA = fieldA.pos[1]
        const startB = fieldB.pos[0]

        expect(endA).toBeLessThan(startB)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      Object.entries(TYPE2_FINE).forEach(([, field]) => {
        const tamanhoCalculado = field.pos[1] - field.pos[0] + 1
        expect(field.size).toBe(tamanhoCalculado)
      })
    })
  })
})


