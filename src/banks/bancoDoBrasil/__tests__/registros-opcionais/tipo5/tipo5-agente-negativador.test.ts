/**
 * Testes do registro Tipo 5, Serviço '08' (Agente Negativador) — Banco do Brasil CNAB 400
 *
 * Valida:
 * - Definição de todos os campos
 * - Posições corretas conforme manual oficial 2024
 * - Integridade do schema (sem sobreposição, tamanhos corretos)
 * - Características específicas do registro
 */

import { TYPE5_CREDIT_BUREAU } from '@banks/bancoDoBrasil/schemas/cnab400/registros-opcionais/type5-optional-services/type5-credit-bureau'

describe('Schema Banco do Brasil CNAB 400 - Registro Tipo 5, Serviço 08 (Agente Negativador)', () => {
  describe('Campos de controle', () => {
    test('deve ter tipo de registro "5" na posição 1', () => {
      expect(TYPE5_CREDIT_BUREAU.tipo_registro.pos).toEqual([1, 1])
      expect(TYPE5_CREDIT_BUREAU.tipo_registro.type).toBe('num')
      expect(TYPE5_CREDIT_BUREAU.tipo_registro.size).toBe(1)
      expect(TYPE5_CREDIT_BUREAU.tipo_registro.pattern).toBe('5')
      expect(TYPE5_CREDIT_BUREAU.tipo_registro.required).toBe(true)
    })

    test('deve ter tipo de serviço "08" na posição 2-3', () => {
      expect(TYPE5_CREDIT_BUREAU.tipo_servico.pos).toEqual([2, 3])
      expect(TYPE5_CREDIT_BUREAU.tipo_servico.type).toBe('num')
      expect(TYPE5_CREDIT_BUREAU.tipo_servico.size).toBe(2)
      expect(TYPE5_CREDIT_BUREAU.tipo_servico.pattern).toBe('08')
      expect(TYPE5_CREDIT_BUREAU.tipo_servico.required).toBe(true)
    })

    test('deve ter código do agente negativador na posição 4-5', () => {
      expect(TYPE5_CREDIT_BUREAU.codigo_agente_negativador.pos).toEqual([4, 5])
      expect(TYPE5_CREDIT_BUREAU.codigo_agente_negativador.type).toBe('num')
      expect(TYPE5_CREDIT_BUREAU.codigo_agente_negativador.size).toBe(2)
      expect(TYPE5_CREDIT_BUREAU.codigo_agente_negativador.required).toBe(true)
    })

    test('codigo_agente_negativador deve ter descrição com os agentes suportados', () => {
      const descricao = TYPE5_CREDIT_BUREAU.codigo_agente_negativador.description
      expect(descricao).toContain('10=Serasa')
      expect(descricao).toContain('11=Quod')
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos na posição 6-394', () => {
      expect(TYPE5_CREDIT_BUREAU.brancos.pos).toEqual([6, 394])
      expect(TYPE5_CREDIT_BUREAU.brancos.type).toBe('alfa')
      expect(TYPE5_CREDIT_BUREAU.brancos.size).toBe(389)
      expect(TYPE5_CREDIT_BUREAU.brancos.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE5_CREDIT_BUREAU.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE5_CREDIT_BUREAU.numero_sequencial.type).toBe('num')
      expect(TYPE5_CREDIT_BUREAU.numero_sequencial.size).toBe(6)
      expect(TYPE5_CREDIT_BUREAU.numero_sequencial.required).toBe(true)
    })

    test('numero_sequencial deve indicar na descrição que é inferido', () => {
      const descricao = TYPE5_CREDIT_BUREAU.numero_sequencial.description
      expect(descricao).toContain('inferido')
      expect(descricao).toContain('manual 2024')
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.entries(TYPE5_CREDIT_BUREAU)
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
      Object.entries(TYPE5_CREDIT_BUREAU).forEach(([_, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          const [start, end] = fieldDef.pos
          const calculatedSize = end - start + 1
          expect(fieldDef.size).toBe(calculatedSize)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const lastField = TYPE5_CREDIT_BUREAU.numero_sequencial
      expect(lastField.pos[1]).toBe(400)
    })

    test('deve ter 5 campos no total', () => {
      const fieldCount = Object.keys(TYPE5_CREDIT_BUREAU).length
      expect(fieldCount).toBe(5)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro e tipo_servico devem ter padrões fixos', () => {
      expect(TYPE5_CREDIT_BUREAU.tipo_registro.pattern).toBe('5')
      expect(TYPE5_CREDIT_BUREAU.tipo_servico.pattern).toBe('08')
    })

    test('campo brancos deve ocupar 389 caracteres (maior campo do layout)', () => {
      expect(TYPE5_CREDIT_BUREAU.brancos.size).toBe(389)

      // Verificar que é o maior campo
      const allSizes = Object.values(TYPE5_CREDIT_BUREAU).map(
        (field: any) => field.size || 0,
      )
      const maxSize = Math.max(...allSizes)
      expect(TYPE5_CREDIT_BUREAU.brancos.size).toBe(maxSize)
    })

    test('deve ter campos obrigatórios e opcionais corretos', () => {
      expect(TYPE5_CREDIT_BUREAU.tipo_registro.required).toBe(true)
      expect(TYPE5_CREDIT_BUREAU.tipo_servico.required).toBe(true)
      expect(TYPE5_CREDIT_BUREAU.codigo_agente_negativador.required).toBe(true)
      expect(TYPE5_CREDIT_BUREAU.numero_sequencial.required).toBe(true)

      expect(TYPE5_CREDIT_BUREAU.brancos.required).toBe(false)
    })

    test('codigo_agente_negativador deve permitir 2 dígitos', () => {
      expect(TYPE5_CREDIT_BUREAU.codigo_agente_negativador.size).toBe(2)
      expect(TYPE5_CREDIT_BUREAU.codigo_agente_negativador.type).toBe('num')
    })

    test('tipo_servico deve ser numérico (diferente de outras variantes que usam alfa)', () => {
      expect(TYPE5_CREDIT_BUREAU.tipo_servico.type).toBe('num')
    })
  })
})
