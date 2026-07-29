/**
 * Testes do registro Tipo 5, Serviço '07' (2º e 3º Descontos) — Banco do Brasil CNAB 400
 *
 * Valida:
 * - Definição de todos os campos
 * - Posições corretas conforme manual oficial 2024
 * - Integridade do schema (sem sobreposição, tamanhos corretos)
 * - Características específicas do registro
 */

import { TYPE5_DISCOUNTS } from '@banks/bancoDoBrasil/schemas/cnab400/registros-opcionais/type5-optional-services/type5-discounts'

describe('Schema Banco do Brasil CNAB 400 - Registro Tipo 5, Serviço 07 (2º e 3º Descontos)', () => {
  describe('Campos de controle', () => {
    test('deve ter tipo de registro "5" na posição 1', () => {
      expect(TYPE5_DISCOUNTS.tipo_registro.pos).toEqual([1, 1])
      expect(TYPE5_DISCOUNTS.tipo_registro.type).toBe('num')
      expect(TYPE5_DISCOUNTS.tipo_registro.size).toBe(1)
      expect(TYPE5_DISCOUNTS.tipo_registro.pattern).toBe('5')
      expect(TYPE5_DISCOUNTS.tipo_registro.required).toBe(true)
    })

    test('deve ter tipo de serviço "07" na posição 2-3', () => {
      expect(TYPE5_DISCOUNTS.tipo_servico.pos).toEqual([2, 3])
      expect(TYPE5_DISCOUNTS.tipo_servico.type).toBe('alfa')
      expect(TYPE5_DISCOUNTS.tipo_servico.size).toBe(2)
      expect(TYPE5_DISCOUNTS.tipo_servico.pattern).toBe('07')
      expect(TYPE5_DISCOUNTS.tipo_servico.required).toBe(true)
    })
  })

  describe('Campos do 2º desconto', () => {
    test('deve ter data limite do 2º desconto na posição 4-9 com formato DDMMAA', () => {
      expect(TYPE5_DISCOUNTS.data_limite_2_desconto.pos).toEqual([4, 9])
      expect(TYPE5_DISCOUNTS.data_limite_2_desconto.type).toBe('data')
      expect(TYPE5_DISCOUNTS.data_limite_2_desconto.size).toBe(6)
      expect(TYPE5_DISCOUNTS.data_limite_2_desconto.dateFormat).toBe('DDMMAA')
      expect(TYPE5_DISCOUNTS.data_limite_2_desconto.required).toBe(false)
    })

    test('data_limite_2_desconto deve ter descrição com regras de negócio', () => {
      const descricao = TYPE5_DISCOUNTS.data_limite_2_desconto.description
      expect(descricao.toLowerCase()).toContain('não pode ser posterior')
      expect(descricao).toContain('vencimento')
      expect(descricao).toContain('desconto anterior')
    })

    test('deve ter valor do 2º desconto na posição 10-26 com 2 decimais', () => {
      expect(TYPE5_DISCOUNTS.valor_2_desconto.pos).toEqual([10, 26])
      expect(TYPE5_DISCOUNTS.valor_2_desconto.type).toBe('num')
      expect(TYPE5_DISCOUNTS.valor_2_desconto.size).toBe(17)
      expect(TYPE5_DISCOUNTS.valor_2_desconto.decimals).toBe(2)
      expect(TYPE5_DISCOUNTS.valor_2_desconto.required).toBe(false)
    })

    test('valor_2_desconto deve ter descrição indicando que deve ser menor que o anterior', () => {
      const descricao = TYPE5_DISCOUNTS.valor_2_desconto.description
      expect(descricao).toContain('menor que o desconto anterior')
    })
  })

  describe('Campos do 3º desconto', () => {
    test('deve ter data limite do 3º desconto na posição 27-32 com formato DDMMAA', () => {
      expect(TYPE5_DISCOUNTS.data_limite_3_desconto.pos).toEqual([27, 32])
      expect(TYPE5_DISCOUNTS.data_limite_3_desconto.type).toBe('data')
      expect(TYPE5_DISCOUNTS.data_limite_3_desconto.size).toBe(6)
      expect(TYPE5_DISCOUNTS.data_limite_3_desconto.dateFormat).toBe('DDMMAA')
      expect(TYPE5_DISCOUNTS.data_limite_3_desconto.required).toBe(false)
    })

    test('data_limite_3_desconto deve ter descrição com regras de negócio', () => {
      const descricao = TYPE5_DISCOUNTS.data_limite_3_desconto.description
      expect(descricao.toLowerCase()).toContain('não pode ser posterior')
      expect(descricao).toContain('vencimento')
      expect(descricao).toContain('desconto anterior')
    })

    test('deve ter valor do 3º desconto na posição 33-49 com 2 decimais', () => {
      expect(TYPE5_DISCOUNTS.valor_3_desconto.pos).toEqual([33, 49])
      expect(TYPE5_DISCOUNTS.valor_3_desconto.type).toBe('num')
      expect(TYPE5_DISCOUNTS.valor_3_desconto.size).toBe(17)
      expect(TYPE5_DISCOUNTS.valor_3_desconto.decimals).toBe(2)
      expect(TYPE5_DISCOUNTS.valor_3_desconto.required).toBe(false)
    })

    test('valor_3_desconto deve ter descrição indicando que deve ser menor que o anterior', () => {
      const descricao = TYPE5_DISCOUNTS.valor_3_desconto.description
      expect(descricao).toContain('menor que o desconto anterior')
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos na posição 50-394', () => {
      expect(TYPE5_DISCOUNTS.brancos.pos).toEqual([50, 394])
      expect(TYPE5_DISCOUNTS.brancos.type).toBe('alfa')
      expect(TYPE5_DISCOUNTS.brancos.size).toBe(345)
      expect(TYPE5_DISCOUNTS.brancos.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE5_DISCOUNTS.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE5_DISCOUNTS.numero_sequencial.type).toBe('num')
      expect(TYPE5_DISCOUNTS.numero_sequencial.size).toBe(6)
      expect(TYPE5_DISCOUNTS.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.entries(TYPE5_DISCOUNTS)
      const positions: Array<{ field: string; start: number; end: number }> = []

      campos.forEach(([fieldName, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          positions.push({
            field: fieldName,
            start: fieldDef.pos[0],
            end: fieldDef.pos[1],
          })
        }
      })

      // Ordenar por posição inicial
      positions.sort((a, b) => a.start - b.start)

      // Verificar sobreposições
      for (let i = 0; i < positions.length - 1; i++) {
        const current = positions[i]
        const next = positions[i + 1]
        expect(current.end).toBeLessThan(next.start)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      Object.entries(TYPE5_DISCOUNTS).forEach(([_, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          const [start, end] = fieldDef.pos
          const calculatedSize = end - start + 1
          expect(fieldDef.size).toBe(calculatedSize)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const lastField = TYPE5_DISCOUNTS.numero_sequencial
      expect(lastField.pos[1]).toBe(400)
    })

    test('deve ter 8 campos no total', () => {
      const fieldCount = Object.keys(TYPE5_DISCOUNTS).length
      expect(fieldCount).toBe(8)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro e tipo_servico devem ter padrões fixos', () => {
      expect(TYPE5_DISCOUNTS.tipo_registro.pattern).toBe('5')
      expect(TYPE5_DISCOUNTS.tipo_servico.pattern).toBe('07')
    })

    test('campo brancos deve ocupar 345 caracteres', () => {
      expect(TYPE5_DISCOUNTS.brancos.size).toBe(345)
    })

    test('campos de valor devem suportar até 999.999.999.999.999,99', () => {
      // Valor máximo derivado do próprio schema (tamanho/decimais)
      const { size, decimals } = TYPE5_DISCOUNTS.valor_2_desconto
      const maxValue = Math.pow(10, size) - 1
      const maxValueInReais = maxValue / Math.pow(10, decimals)

      expect(maxValueInReais).toBe(999999999999999.99)
      expect(TYPE5_DISCOUNTS.valor_3_desconto.size).toBe(size)
      expect(TYPE5_DISCOUNTS.valor_3_desconto.decimals).toBe(decimals)
    })

    test('deve ter campos obrigatórios e opcionais corretos', () => {
      expect(TYPE5_DISCOUNTS.tipo_registro.required).toBe(true)
      expect(TYPE5_DISCOUNTS.tipo_servico.required).toBe(true)
      expect(TYPE5_DISCOUNTS.numero_sequencial.required).toBe(true)

      expect(TYPE5_DISCOUNTS.data_limite_2_desconto.required).toBe(false)
      expect(TYPE5_DISCOUNTS.valor_2_desconto.required).toBe(false)
      expect(TYPE5_DISCOUNTS.data_limite_3_desconto.required).toBe(false)
      expect(TYPE5_DISCOUNTS.valor_3_desconto.required).toBe(false)
      expect(TYPE5_DISCOUNTS.brancos.required).toBe(false)
    })

    test('valores de desconto devem ter 17 posições com 2 decimais', () => {
      expect(TYPE5_DISCOUNTS.valor_2_desconto.size).toBe(17)
      expect(TYPE5_DISCOUNTS.valor_2_desconto.decimals).toBe(2)
      expect(TYPE5_DISCOUNTS.valor_3_desconto.size).toBe(17)
      expect(TYPE5_DISCOUNTS.valor_3_desconto.decimals).toBe(2)
    })

    test('datas de desconto devem ter 6 posições no formato DDMMAA', () => {
      expect(TYPE5_DISCOUNTS.data_limite_2_desconto.size).toBe(6)
      expect(TYPE5_DISCOUNTS.data_limite_2_desconto.dateFormat).toBe('DDMMAA')
      expect(TYPE5_DISCOUNTS.data_limite_3_desconto.size).toBe(6)
      expect(TYPE5_DISCOUNTS.data_limite_3_desconto.dateFormat).toBe('DDMMAA')
    })
  })
})
