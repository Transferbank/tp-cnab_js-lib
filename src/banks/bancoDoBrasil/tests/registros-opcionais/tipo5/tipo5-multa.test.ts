/**
 * Testes do registro Tipo 5, Serviço '99' (Multa) — Banco do Brasil CNAB 400
 *
 * Valida:
 * - Definição de todos os campos
 * - Posições corretas conforme manual oficial
 * - Integridade do schema (sem sobreposição, tamanhos corretos)
 * - Características específicas do registro
 */

import { TYPE5_FINE } from '@banks/bancoDoBrasil/schemas/cnab400/registros-opcionais/type5-optional-services/type5-fine'

describe('Schema Banco do Brasil CNAB 400 - Registro Tipo 5, Serviço 99 (Multa)', () => {
  describe('Campos de controle', () => {
    test('deve ter tipo de registro "5" na posição 1', () => {
      expect(TYPE5_FINE.tipo_registro.pos).toEqual([1, 1])
      expect(TYPE5_FINE.tipo_registro.type).toBe('num')
      expect(TYPE5_FINE.tipo_registro.size).toBe(1)
      expect(TYPE5_FINE.tipo_registro.pattern).toBe('5')
      expect(TYPE5_FINE.tipo_registro.required).toBe(true)
    })

    test('deve ter tipo de serviço "99" na posição 2-3', () => {
      expect(TYPE5_FINE.tipo_servico.pos).toEqual([2, 3])
      expect(TYPE5_FINE.tipo_servico.type).toBe('alfa')
      expect(TYPE5_FINE.tipo_servico.size).toBe(2)
      expect(TYPE5_FINE.tipo_servico.pattern).toBe('99')
      expect(TYPE5_FINE.tipo_servico.required).toBe(true)
    })

    test('deve ter código de multa na posição 4', () => {
      expect(TYPE5_FINE.codigo_multa.pos).toEqual([4, 4])
      expect(TYPE5_FINE.codigo_multa.type).toBe('num')
      expect(TYPE5_FINE.codigo_multa.size).toBe(1)
      expect(TYPE5_FINE.codigo_multa.required).toBe(true)
      expect(TYPE5_FINE.codigo_multa.description).toContain('1=Valor')
      expect(TYPE5_FINE.codigo_multa.description).toContain('2=Percentual')
      expect(TYPE5_FINE.codigo_multa.description).toContain('9=Dispensar')
    })
  })

  describe('Campos de data e valor', () => {
    test('deve ter data de início da multa na posição 5-10 com formato DDMMAA', () => {
      expect(TYPE5_FINE.data_inicio_multa.pos).toEqual([5, 10])
      expect(TYPE5_FINE.data_inicio_multa.type).toBe('data')
      expect(TYPE5_FINE.data_inicio_multa.size).toBe(6)
      expect(TYPE5_FINE.data_inicio_multa.dateFormat).toBe('DDMMAA')
      expect(TYPE5_FINE.data_inicio_multa.required).toBe(false)
    })

    test('deve ter valor/percentual da multa na posição 11-22 com 2 decimais', () => {
      expect(TYPE5_FINE.valor_percentual_multa.pos).toEqual([11, 22])
      expect(TYPE5_FINE.valor_percentual_multa.type).toBe('num')
      expect(TYPE5_FINE.valor_percentual_multa.size).toBe(12)
      expect(TYPE5_FINE.valor_percentual_multa.decimals).toBe(2)
      expect(TYPE5_FINE.valor_percentual_multa.required).toBe(false)
    })

    test('valor_percentual_multa deve ter descrição explicando as variações por codigo_multa', () => {
      const descricao = TYPE5_FINE.valor_percentual_multa.description
      expect(descricao).toContain('codigo_multa=1')
      expect(descricao).toContain('codigo_multa=2')
      expect(descricao).toContain('codigo_multa=9')
    })
  })

  describe('Campos finais', () => {
    test('deve ter dias de recebimento após vencimento na posição 23-25', () => {
      expect(TYPE5_FINE.dias_recebimento_apos_vencimento.pos).toEqual([23, 25])
      expect(TYPE5_FINE.dias_recebimento_apos_vencimento.type).toBe('num')
      expect(TYPE5_FINE.dias_recebimento_apos_vencimento.size).toBe(3)
      expect(TYPE5_FINE.dias_recebimento_apos_vencimento.required).toBe(false)
      expect(TYPE5_FINE.dias_recebimento_apos_vencimento.description).toContain('comando=01')
      expect(TYPE5_FINE.dias_recebimento_apos_vencimento.description).toContain(
        'boleto proposta',
      )
    })

    test('deve ter brancos na posição 26-394', () => {
      expect(TYPE5_FINE.brancos.pos).toEqual([26, 394])
      expect(TYPE5_FINE.brancos.type).toBe('alfa')
      expect(TYPE5_FINE.brancos.size).toBe(369)
      expect(TYPE5_FINE.brancos.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE5_FINE.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE5_FINE.numero_sequencial.type).toBe('num')
      expect(TYPE5_FINE.numero_sequencial.size).toBe(6)
      expect(TYPE5_FINE.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.entries(TYPE5_FINE)
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
      Object.entries(TYPE5_FINE).forEach(([_, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          const [start, end] = fieldDef.pos
          const calculatedSize = end - start + 1
          expect(fieldDef.size).toBe(calculatedSize)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const lastField = TYPE5_FINE.numero_sequencial
      expect(lastField.pos[1]).toBe(400)
    })

    test('deve ter 8 campos no total', () => {
      const fieldCount = Object.keys(TYPE5_FINE).length
      expect(fieldCount).toBe(8)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro e tipo_servico devem ter padrões fixos', () => {
      expect(TYPE5_FINE.tipo_registro.pattern).toBe('5')
      expect(TYPE5_FINE.tipo_servico.pattern).toBe('99')
    })

    test('campo brancos deve ocupar 369 caracteres (maior campo do layout)', () => {
      expect(TYPE5_FINE.brancos.size).toBe(369)

      // Verificar que é o maior campo
      const allSizes = Object.values(TYPE5_FINE).map((field: any) => field.size || 0)
      const maxSize = Math.max(...allSizes)
      expect(TYPE5_FINE.brancos.size).toBe(maxSize)
    })

    test('valor_percentual_multa deve suportar valores até 9.999.999.999,99', () => {
      // Valor máximo derivado do próprio schema (tamanho/decimais), não hardcoded —
      // se alguém alterar tamanho ou decimais, este teste reflete o novo limite real.
      const { size, decimals } = TYPE5_FINE.valor_percentual_multa
      const maxValue = Math.pow(10, size) - 1
      const maxValueInReais = maxValue / Math.pow(10, decimals)

      expect(maxValueInReais).toBe(9999999999.99)
    })

    test('deve ter campos obrigatórios e opcionais corretos', () => {
      expect(TYPE5_FINE.tipo_registro.required).toBe(true)
      expect(TYPE5_FINE.tipo_servico.required).toBe(true)
      expect(TYPE5_FINE.codigo_multa.required).toBe(true)
      expect(TYPE5_FINE.numero_sequencial.required).toBe(true)

      expect(TYPE5_FINE.data_inicio_multa.required).toBe(false)
      expect(TYPE5_FINE.valor_percentual_multa.required).toBe(false)
      expect(TYPE5_FINE.dias_recebimento_apos_vencimento.required).toBe(false)
      expect(TYPE5_FINE.brancos.required).toBe(false)
    })

    test('codigo_multa deve permitir apenas 1 dígito', () => {
      expect(TYPE5_FINE.codigo_multa.size).toBe(1)
      expect(TYPE5_FINE.codigo_multa.type).toBe('num')
    })
  })
})

