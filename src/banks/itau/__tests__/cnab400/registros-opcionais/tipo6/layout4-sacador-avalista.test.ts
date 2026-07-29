/**
 * Testes do Schema Itaú CNAB 400 - Registro Tipo 6, Layout 4 (Sacador/Avalista)
 *
 * Registro para emissão física de boleto pelo cedente (fluxo paralelo ao tipo 1).
 * Layout 4 contém a extensão de dados do sacador/avalista.
 */

import { TYPE6_LAYOUT4_ENDORSER } from '../../../../../../../src/banks/itau/schemas/cnab400/registros-opcionais/type6-boleto-emission/layout4-endorser'

describe('Schema Itaú CNAB 400 - Registro Tipo 6, Layout 4 (Sacador/Avalista)', () => {
  describe('Campos de identificação', () => {
    test('deve ter tipo de registro "6" na posição 1', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.tipo_registro

      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.pattern).toBe('6')
    })

    test('deve ter código de layout "4" na posição 2', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.codigo_layout

      expect(field.pos).toEqual([2, 2])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.pattern).toBe('4')
    })
  })

  describe('Dados de identificação do sacador/avalista', () => {
    test('deve ter código de inscrição na posição 3-4', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.codigo_inscricao

      expect(field.pos).toEqual([3, 4])
      expect(field.type).toBe('num')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('deve ter número de inscrição (CPF/CNPJ) na posição 5-18', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.numero_inscricao

      expect(field.pos).toEqual([5, 18])
      expect(field.type).toBe('num')
      expect(field.size).toBe(14)
      expect(field.required).toBe(false)
    })

    test('número de inscrição deve suportar CPF (11) e CNPJ (14)', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.numero_inscricao

      expect(field.size).toBe(14)
      expect(field.description).toContain('CPF')
      expect(field.description).toContain('CNPJ')
    })
  })

  describe('Endereço completo do sacador/avalista', () => {
    test('deve ter logradouro na posição 19-58', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.logradouro

      expect(field.pos).toEqual([19, 58])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(false)
    })

    test('deve ter bairro na posição 59-70', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.bairro

      expect(field.pos).toEqual([59, 70])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(12)
      expect(field.required).toBe(false)
    })

    test('deve ter CEP na posição 71-78', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.cep

      expect(field.pos).toEqual([71, 78])
      expect(field.type).toBe('num')
      expect(field.size).toBe(8)
      expect(field.required).toBe(false)
    })

    test('deve ter cidade na posição 79-93', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.cidade

      expect(field.pos).toEqual([79, 93])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(15)
      expect(field.required).toBe(false)
    })

    test('deve ter estado (UF) na posição 94-95', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.estado

      expect(field.pos).toEqual([94, 95])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(2)
      expect(field.required).toBe(false)
    })

    test('todos os campos de endereço devem estar presentes', () => {
      expect(TYPE6_LAYOUT4_ENDORSER.logradouro).toBeDefined()
      expect(TYPE6_LAYOUT4_ENDORSER.bairro).toBeDefined()
      expect(TYPE6_LAYOUT4_ENDORSER.cep).toBeDefined()
      expect(TYPE6_LAYOUT4_ENDORSER.cidade).toBeDefined()
      expect(TYPE6_LAYOUT4_ENDORSER.estado).toBeDefined()
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos na posição 96-394', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.brancos

      expect(field.pos).toEqual([96, 394])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(299)
      expect(field.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.numero_sequencial

      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const fields = Object.entries(TYPE6_LAYOUT4_ENDORSER).sort(
        (a, b) => a[1].pos[0] - b[1].pos[0],
      )

      for (let i = 0; i < fields.length - 1; i++) {
        const [, fieldA] = fields[i]
        const [, fieldB] = fields[i + 1]

        const endA = fieldA.pos[1]
        const startB = fieldB.pos[0]

        expect(endA).toBeLessThan(startB)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      Object.entries(TYPE6_LAYOUT4_ENDORSER).forEach(([, field]) => {
        const tamanhoCalculado = field.pos[1] - field.pos[0] + 1
        expect(field.size).toBe(tamanhoCalculado)
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE6_LAYOUT4_ENDORSER.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro e codigo_layout devem ter padrões fixos', () => {
      expect(TYPE6_LAYOUT4_ENDORSER.tipo_registro.pattern).toBe('6')
      expect(TYPE6_LAYOUT4_ENDORSER.codigo_layout.pattern).toBe('4')
    })

    test('campo brancos deve ser um dos maiores do layout (299 caracteres)', () => {
      const field = TYPE6_LAYOUT4_ENDORSER.brancos

      expect(field.size).toBe(299)

      // Verificar se é o maior campo
      const camposPorTamanho = Object.entries(TYPE6_LAYOUT4_ENDORSER)
        .map(([name, field]) => ({ name, size: field.size }))
        .sort((a, b) => b.size - a.size)

      expect(camposPorTamanho[0].name).toBe('brancos')
    })
  })
})

