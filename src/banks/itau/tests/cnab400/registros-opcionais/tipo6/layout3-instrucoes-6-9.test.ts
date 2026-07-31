/**
 * Testes do Schema Itaú CNAB 400 - Registro Tipo 6, Layout 3 (Instruções 6-9)
 *
 * Registro para emissão física de boleto pelo cedente (fluxo paralelo ao tipo 1).
 * Layout 3 contém as linhas de instrução 6 a 9 (4 campos de 69 caracteres cada).
 */

import { TYPE6_LAYOUT3_INSTRUCTIONS_6_9 } from '@banks/itau/schemas/cnab400/registros-opcionais/type6-boleto-emission/layout3-instructions-6-9'

describe('Schema Itaú CNAB 400 - Registro Tipo 6, Layout 3 (Instruções 6-9)', () => {
  describe('Campos de identificação', () => {
    test('deve ter tipo de registro "6" na posição 1', () => {
      const field = TYPE6_LAYOUT3_INSTRUCTIONS_6_9.tipo_registro

      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.pattern).toBe('6')
    })

    test('deve ter código de layout "3" na posição 2', () => {
      const field = TYPE6_LAYOUT3_INSTRUCTIONS_6_9.codigo_layout

      expect(field.pos).toEqual([2, 2])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.pattern).toBe('3')
    })
  })

  describe('Linhas de instrução (6-9)', () => {
    test('deve ter 4 linhas de instrução', () => {
      expect(TYPE6_LAYOUT3_INSTRUCTIONS_6_9.linha_6).toBeDefined()
      expect(TYPE6_LAYOUT3_INSTRUCTIONS_6_9.linha_7).toBeDefined()
      expect(TYPE6_LAYOUT3_INSTRUCTIONS_6_9.linha_8).toBeDefined()
      expect(TYPE6_LAYOUT3_INSTRUCTIONS_6_9.linha_9).toBeDefined()
    })

    test('todas as linhas devem ter 69 caracteres', () => {
      for (let i = 6; i <= 9; i++) {
        const field = TYPE6_LAYOUT3_INSTRUCTIONS_6_9[`linha_${i}`]

        expect(field.size).toBe(69)
        expect(field.type).toBe('alfa')
        expect(field.required).toBe(false)
      }
    })

    test('linha 6 deve começar na posição 3', () => {
      const field = TYPE6_LAYOUT3_INSTRUCTIONS_6_9.linha_6

      expect(field.pos[0]).toBe(3)
      expect(field.pos[1]).toBe(71)
    })

    test('linhas devem ser contíguas', () => {
      for (let i = 6; i < 9; i++) {
        const linhaAtual = TYPE6_LAYOUT3_INSTRUCTIONS_6_9[`linha_${i}`]
        const proximaLinha = TYPE6_LAYOUT3_INSTRUCTIONS_6_9[`linha_${i + 1}`]

        expect(proximaLinha.pos[0]).toBe(linhaAtual.pos[1] + 1)
      }
    })

    test('linha 9 deve terminar na posição 278', () => {
      const field = TYPE6_LAYOUT3_INSTRUCTIONS_6_9.linha_9

      expect(field.pos[1]).toBe(278)
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos na posição 279-394', () => {
      const field = TYPE6_LAYOUT3_INSTRUCTIONS_6_9.brancos

      expect(field.pos).toEqual([279, 394])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(116)
      expect(field.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = TYPE6_LAYOUT3_INSTRUCTIONS_6_9.numero_sequencial

      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const fields = Object.entries(TYPE6_LAYOUT3_INSTRUCTIONS_6_9).sort(
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
      Object.entries(TYPE6_LAYOUT3_INSTRUCTIONS_6_9).forEach(([, field]) => {
        const tamanhoCalculado = field.pos[1] - field.pos[0] + 1
        expect(field.size).toBe(tamanhoCalculado)
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE6_LAYOUT3_INSTRUCTIONS_6_9.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })
  })

  describe('Características específicas', () => {
    test('total de caracteres de instruções deve ser 276 (4 linhas × 69)', () => {
      const totalCaracteres = 4 * 69
      expect(totalCaracteres).toBe(276)

      // Verificar que as posições batem: 3 até 278 = 276 posições
      const inicio = TYPE6_LAYOUT3_INSTRUCTIONS_6_9.linha_6.pos[0]
      const fim = TYPE6_LAYOUT3_INSTRUCTIONS_6_9.linha_9.pos[1]
      expect(fim - inicio + 1).toBe(276)
    })

    test('tipo_registro e codigo_layout devem ter padrões fixos', () => {
      expect(TYPE6_LAYOUT3_INSTRUCTIONS_6_9.tipo_registro.pattern).toBe('6')
      expect(TYPE6_LAYOUT3_INSTRUCTIONS_6_9.codigo_layout.pattern).toBe('3')
    })

    test('deve ter menos linhas que layout 2 (4 vs 5)', () => {
      const campos = Object.keys(TYPE6_LAYOUT3_INSTRUCTIONS_6_9).filter((key) =>
        key.startsWith('linha_'),
      )

      expect(campos.length).toBe(4)
    })
  })
})


