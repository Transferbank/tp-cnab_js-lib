/**
 * Testes do Schema Itaú CNAB 400 - Registro Tipo 6, Layout 1 (Dados do Título)
 *
 * Registro para emissão física de boleto pelo cedente (fluxo paralelo ao tipo 1).
 * Layout 1 contém os dados principais do título.
 */

import { TYPE6_LAYOUT1_TITLE } from '../../../../../../../src/banks/itau/schemas/cnab400/registros-opcionais/type6-boleto-emission/layout1-title'

describe('Schema Itaú CNAB 400 - Registro Tipo 6, Layout 1 (Título)', () => {
  describe('Campos de identificação', () => {
    test('deve ter tipo de registro "6" na posição 1', () => {
      const field = TYPE6_LAYOUT1_TITLE.tipo_registro

      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.pattern).toBe('6')
    })

    test('deve ter código de layout "1" na posição 2', () => {
      const field = TYPE6_LAYOUT1_TITLE.codigo_layout

      expect(field.pos).toEqual([2, 2])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.pattern).toBe('1')
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const fields = Object.entries(TYPE6_LAYOUT1_TITLE).sort((a, b) => a[1].pos[0] - b[1].pos[0])

      for (let i = 0; i < fields.length - 1; i++) {
        const [, fieldA] = fields[i]
        const [, fieldB] = fields[i + 1]

        const endA = fieldA.pos[1]
        const startB = fieldB.pos[0]

        expect(endA).toBeLessThan(startB)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      Object.entries(TYPE6_LAYOUT1_TITLE).forEach(([, field]) => {
        const tamanhoCalculado = field.pos[1] - field.pos[0] + 1
        expect(field.size).toBe(tamanhoCalculado)
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE6_LAYOUT1_TITLE.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })
  })

  describe('Características específicas do layout 1', () => {
    test('deve ter campo valor_titulo com 2 decimais (fixo, sem lógica condicional para moeda variável)', () => {
      const field = TYPE6_LAYOUT1_TITLE.valor_titulo

      expect(field.decimals).toBe(2)
      expect(field.size).toBe(13)
      expect(field.description).toContain('moeda variável')
    })

    test('deve ter nosso_numero obrigatório', () => {
      const field = TYPE6_LAYOUT1_TITLE.nosso_numero

      expect(field.required).toBe(true)
      expect(field.size).toBe(8)
    })

    test('deve ter dados completos do pagador', () => {
      expect(TYPE6_LAYOUT1_TITLE.nome).toBeDefined()
      expect(TYPE6_LAYOUT1_TITLE.logradouro).toBeDefined()
      expect(TYPE6_LAYOUT1_TITLE.bairro).toBeDefined()
      expect(TYPE6_LAYOUT1_TITLE.cep).toBeDefined()
      expect(TYPE6_LAYOUT1_TITLE.cidade).toBeDefined()
      expect(TYPE6_LAYOUT1_TITLE.estado).toBeDefined()
    })

    test('tipo_registro e codigo_layout devem ter padrões fixos', () => {
      expect(TYPE6_LAYOUT1_TITLE.tipo_registro.pattern).toBe('6')
      expect(TYPE6_LAYOUT1_TITLE.codigo_layout.pattern).toBe('1')
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = TYPE6_LAYOUT1_TITLE.numero_sequencial

      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })
})

