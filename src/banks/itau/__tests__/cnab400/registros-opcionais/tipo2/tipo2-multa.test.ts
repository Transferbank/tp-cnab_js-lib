/**
 * Testes do Schema Itaú CNAB 400 - Registro Tipo 2 (Complemento de Multa)
 *
 * Registro opcional que define valores/percentuais de multa.
 * Deve vir imediatamente após o detalhe (tipo 1) correspondente.
 */

import { TYPE2_FINE } from '@banks/itau/schemas/cnab400/registros-opcionais/type2-fine/type2-fine'

describe('Schema Itaú CNAB 400 - Registro Tipo 2 (Multa)', () => {
  describe('Definição dos campos', () => {
    test('deve ter tipo de registro "2" na posição 1', () => {
      const field = TYPE2_FINE.tipo_registro

      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.pattern).toBe('2')
    })

    test('deve ter código de multa na posição 2', () => {
      const field = TYPE2_FINE.cod_multa

      expect(field.pos).toEqual([2, 2])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter data de multa na posição 3-10 com formato DDMMAAAA', () => {
      const field = TYPE2_FINE.data_multa

      expect(field.pos).toEqual([3, 10])
      expect(field.type).toBe('data')
      expect(field.size).toBe(8)
      expect(field.dateFormat).toBe('DDMMAAAA')
      expect(field.required).toBe(false)
      expect(field.description).toContain('8 dígitos')
      expect(field.description).toContain('diferente do padrão DDMMAA')
    })

    test('deve ter valor/percentual de multa na posição 11-23 com 2 decimais', () => {
      const field = TYPE2_FINE.multa

      expect(field.pos).toEqual([11, 23])
      expect(field.type).toBe('num')
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter brancos na posição 24-394', () => {
      const field = TYPE2_FINE.brancos

      expect(field.pos).toEqual([24, 394])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(371)
      expect(field.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = TYPE2_FINE.numero_sequencial

      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
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

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE2_FINE.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })
  })

  describe('Características específicas', () => {
    test('data_multa deve usar formato DDMMAAAA (8 dígitos) diferente do padrão DDMMAA', () => {
      const field = TYPE2_FINE.data_multa

      expect(field.dateFormat).toBe('DDMMAAAA')
      expect(field.size).toBe(8)

      // Confirmar que é diferente do formato padrão usado nos outros campos
      expect(field.dateFormat).not.toBe('DDMMAA')
    })

    test('campo brancos deve ocupar 371 caracteres (maior campo do layout)', () => {
      const field = TYPE2_FINE.brancos

      expect(field.size).toBe(371)

      // Verificar se é o maior campo
      const camposPorTamanho = Object.entries(TYPE2_FINE)
        .map(([name, field]) => ({ name, size: field.size }))
        .sort((a, b) => b.size - a.size)

      expect(camposPorTamanho[0].name).toBe('brancos')
    })

    test('tipo_registro deve ter padrão "2" fixo', () => {
      const field = TYPE2_FINE.tipo_registro

      expect(field.pattern).toBe('2')
      expect(field.required).toBe(true)
    })

    test('multa deve suportar valores até 99.999.999.999,99', () => {
      const field = TYPE2_FINE.multa

      // 13 posições com 2 decimais = 11 dígitos inteiros + 2 decimais
      expect(field.size).toBe(13)
      expect(field.decimals).toBe(2)

      // Valor máximo: 99999999999.99
      const valorMaximo = Math.pow(10, 11) - 0.01
      expect(valorMaximo).toBe(99999999999.99)
    })
  })
})

