/**
 * Testes de Integridade - Sicoob CNAB 400
 *
 * Verifica se não há sobreposição de posições e se os tamanhos
 * declarados batem com as posições dos campos.
 */

import { sicoobCnab400 } from '../../../../../src/banks/sicoob/schemas/cnab400'

describe('Schema Sicoob CNAB 400 - Integridade', () => {
  describe('Header de Arquivo', () => {
    test('não deve ter sobreposição de posições', () => {
      const header = sicoobCnab400.header!
      const campos = Object.keys(header)
      const posicoes = campos.map((campo) => header[campo].pos)

      for (let i = 0; i < posicoes.length; i++) {
        for (let j = i + 1; j < posicoes.length; j++) {
          const [start1, end1] = posicoes[i]
          const [start2, end2] = posicoes[j]

          // Verifica se há sobreposição
          const sobrepoe =
            (start1 >= start2 && start1 <= end2) || (start2 >= start1 && start2 <= end1)

          if (sobrepoe) {
            fail(
              `Sobreposição detectada: ${campos[i]} [${start1},${end1}] e ${campos[j]} [${start2},${end2}]`,
            )
          }
        }
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      const header = sicoobCnab400.header!
      const campos = Object.keys(header)

      campos.forEach((campo) => {
        const { pos, size } = header[campo]
        const tamanhoCalculado = pos[1] - pos[0] + 1
        expect(tamanhoCalculado).toBe(size)
      })
    })
  })

  describe('Detail', () => {
    test('não deve ter sobreposição de posições', () => {
      const detail = sicoobCnab400.detail!
      const campos = Object.keys(detail)
      const posicoes = campos.map((campo) => detail[campo].pos)

      for (let i = 0; i < posicoes.length; i++) {
        for (let j = i + 1; j < posicoes.length; j++) {
          const [start1, end1] = posicoes[i]
          const [start2, end2] = posicoes[j]

          // Verifica se há sobreposição
          const sobrepoe =
            (start1 >= start2 && start1 <= end2) || (start2 >= start1 && start2 <= end1)

          if (sobrepoe) {
            fail(
              `Sobreposição detectada: ${campos[i]} [${start1},${end1}] e ${campos[j]} [${start2},${end2}]`,
            )
          }
        }
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      const detail = sicoobCnab400.detail!
      const campos = Object.keys(detail)

      campos.forEach((campo) => {
        const { pos, size } = detail[campo]
        const tamanhoCalculado = pos[1] - pos[0] + 1
        expect(tamanhoCalculado).toBe(size)
      })
    })
  })

  describe('Trailer', () => {
    test('não deve ter sobreposição de posições', () => {
      const trailer = sicoobCnab400.trailer!
      const campos = Object.keys(trailer)
      const posicoes = campos.map((campo) => trailer[campo].pos)

      for (let i = 0; i < posicoes.length; i++) {
        for (let j = i + 1; j < posicoes.length; j++) {
          const [start1, end1] = posicoes[i]
          const [start2, end2] = posicoes[j]

          // Verifica se há sobreposição
          const sobrepoe =
            (start1 >= start2 && start1 <= end2) || (start2 >= start1 && start2 <= end1)

          if (sobrepoe) {
            fail(
              `Sobreposição detectada: ${campos[i]} [${start1},${end1}] e ${campos[j]} [${start2},${end2}]`,
            )
          }
        }
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      const trailer = sicoobCnab400.trailer!
      const campos = Object.keys(trailer)

      campos.forEach((campo) => {
        const { pos, size } = trailer[campo]
        const tamanhoCalculado = pos[1] - pos[0] + 1
        expect(tamanhoCalculado).toBe(size)
      })
    })
  })
})

