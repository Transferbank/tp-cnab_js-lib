/**
 * Testes do Schema Itaú CNAB 400 - Registro Tipo 6, Layout 2 (Instruções 1-5)
 *
 * Registro para emissão física de boleto pelo cedente (fluxo paralelo ao tipo 1).
 * Layout 2 contém as linhas de instrução 1 a 5 (5 campos de 69 caracteres cada).
 */

import { TYPE6_LAYOUT2_INSTRUCTIONS_1_5 } from '@banks/itau/schemas/cnab400/registros-opcionais/type6-boleto-emission/layout2-instructions-1-5'

describe('Schema Itaú CNAB 400 - Registro Tipo 6, Layout 2 (Instruções 1-5)', () => {
  describe('Campos de identificação', () => {
    test('deve ter tipo de registro "6" na posição 1', () => {
      const field = TYPE6_LAYOUT2_INSTRUCTIONS_1_5.tipo_registro

      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.pattern).toBe('6')
    })

    test('deve ter código de layout "2" na posição 2', () => {
      const field = TYPE6_LAYOUT2_INSTRUCTIONS_1_5.codigo_layout

      expect(field.pos).toEqual([2, 2])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.pattern).toBe('2')
    })
  })

  describe('Linhas de instrução (1-5)', () => {
    test('deve ter 5 linhas de instrução', () => {
      expect(TYPE6_LAYOUT2_INSTRUCTIONS_1_5.linha_1).toBeDefined()
      expect(TYPE6_LAYOUT2_INSTRUCTIONS_1_5.linha_2).toBeDefined()
      expect(TYPE6_LAYOUT2_INSTRUCTIONS_1_5.linha_3).toBeDefined()
      expect(TYPE6_LAYOUT2_INSTRUCTIONS_1_5.linha_4).toBeDefined()
      expect(TYPE6_LAYOUT2_INSTRUCTIONS_1_5.linha_5).toBeDefined()
    })

    test('todas as linhas devem ter 69 caracteres', () => {
      for (let i = 1; i <= 5; i++) {
        const field = TYPE6_LAYOUT2_INSTRUCTIONS_1_5[`linha_${i}`]

        expect(field.size).toBe(69)
        expect(field.type).toBe('alfa')
        expect(field.required).toBe(false)
      }
    })

    test('linha 1 deve começar na posição 3', () => {
      const field = TYPE6_LAYOUT2_INSTRUCTIONS_1_5.linha_1

      expect(field.pos[0]).toBe(3)
      expect(field.pos[1]).toBe(71)
    })

    test('linhas devem ser contíguas', () => {
      for (let i = 1; i < 5; i++) {
        const linhaAtual = TYPE6_LAYOUT2_INSTRUCTIONS_1_5[`linha_${i}`]
        const proximaLinha = TYPE6_LAYOUT2_INSTRUCTIONS_1_5[`linha_${i + 1}`]

        expect(proximaLinha.pos[0]).toBe(linhaAtual.pos[1] + 1)
      }
    })

    test('linha 5 deve terminar na posição 347', () => {
      const field = TYPE6_LAYOUT2_INSTRUCTIONS_1_5.linha_5

      expect(field.pos[1]).toBe(347)
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos na posição 348-394', () => {
      const field = TYPE6_LAYOUT2_INSTRUCTIONS_1_5.brancos

      expect(field.pos).toEqual([348, 394])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(47)
      expect(field.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = TYPE6_LAYOUT2_INSTRUCTIONS_1_5.numero_sequencial

      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const fields = Object.entries(TYPE6_LAYOUT2_INSTRUCTIONS_1_5).sort(
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
      Object.entries(TYPE6_LAYOUT2_INSTRUCTIONS_1_5).forEach(([, field]) => {
        const tamanhoCalculado = field.pos[1] - field.pos[0] + 1
        expect(field.size).toBe(tamanhoCalculado)
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE6_LAYOUT2_INSTRUCTIONS_1_5.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })
  })

  describe('Características específicas', () => {
    test('total de caracteres de instruções deve ser 345 (5 linhas × 69)', () => {
      const totalCaracteres = 5 * 69
      expect(totalCaracteres).toBe(345)

      // Verificar que as posições batem: 3 até 347 = 345 posições
      const inicio = TYPE6_LAYOUT2_INSTRUCTIONS_1_5.linha_1.pos[0]
      const fim = TYPE6_LAYOUT2_INSTRUCTIONS_1_5.linha_5.pos[1]
      expect(fim - inicio + 1).toBe(345)
    })

    test('tipo_registro e codigo_layout devem ter padrões fixos', () => {
      expect(TYPE6_LAYOUT2_INSTRUCTIONS_1_5.tipo_registro.pattern).toBe('6')
      expect(TYPE6_LAYOUT2_INSTRUCTIONS_1_5.codigo_layout.pattern).toBe('2')
    })
  })
})


