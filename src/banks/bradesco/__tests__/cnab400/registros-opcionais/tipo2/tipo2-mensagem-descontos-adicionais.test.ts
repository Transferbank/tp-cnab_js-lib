/**
 * Testes do registro Tipo 2 (Mensagem / Descontos Adicionais) — Bradesco CNAB 400
 *
 * Valida:
 * - Definição de todos os campos
 * - Posições corretas conforme manual oficial
 * - Integridade do schema (sem sobreposição, tamanhos corretos)
 * - Características específicas do registro
 */

import { TYPE2_MESSAGES_DISCOUNTS } from '@banks/bradesco/schemas/cnab400/registros-opcionais/type2-messages-discounts/type2-messages-discounts'

describe('Schema Bradesco CNAB 400 - Registro Tipo 2 (Mensagem / Descontos Adicionais)', () => {
  describe('Campos de controle', () => {
    test('deve ter tipo de registro "2" na posição 1', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.tipo_registro.pos).toEqual([1, 1])
      expect(TYPE2_MESSAGES_DISCOUNTS.tipo_registro.type).toBe('num')
      expect(TYPE2_MESSAGES_DISCOUNTS.tipo_registro.size).toBe(1)
      expect(TYPE2_MESSAGES_DISCOUNTS.tipo_registro.pattern).toBe('2')
      expect(TYPE2_MESSAGES_DISCOUNTS.tipo_registro.required).toBe(true)
    })
  })

  describe('Campos de mensagens', () => {
    test('deve ter 4 campos de mensagem de 80 caracteres cada', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_1.size).toBe(80)
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_2.size).toBe(80)
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_3.size).toBe(80)
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_4.size).toBe(80)
    })

    test('mensagem_1 deve estar na posição 2-81', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_1.pos).toEqual([2, 81])
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_1.type).toBe('alfa')
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_1.required).toBe(false)
    })

    test('mensagem_2 deve estar na posição 82-161', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_2.pos).toEqual([82, 161])
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_2.type).toBe('alfa')
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_2.required).toBe(false)
    })

    test('mensagem_3 deve estar na posição 162-241', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_3.pos).toEqual([162, 241])
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_3.type).toBe('alfa')
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_3.required).toBe(false)
    })

    test('mensagem_4 deve estar na posição 242-321', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_4.pos).toEqual([242, 321])
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_4.type).toBe('alfa')
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_4.required).toBe(false)
    })

    test('todas as mensagens devem ser do tipo alfa e opcionais', () => {
      const mensagens = [
        TYPE2_MESSAGES_DISCOUNTS.mensagem_1,
        TYPE2_MESSAGES_DISCOUNTS.mensagem_2,
        TYPE2_MESSAGES_DISCOUNTS.mensagem_3,
        TYPE2_MESSAGES_DISCOUNTS.mensagem_4,
      ]

      mensagens.forEach((mensagem) => {
        expect(mensagem.type).toBe('alfa')
        expect(mensagem.required).toBe(false)
      })
    })

    test('todas as mensagens devem ter descrição mencionando regra dos 41 caracteres', () => {
      const mensagens = [
        TYPE2_MESSAGES_DISCOUNTS.mensagem_1,
        TYPE2_MESSAGES_DISCOUNTS.mensagem_2,
        TYPE2_MESSAGES_DISCOUNTS.mensagem_3,
        TYPE2_MESSAGES_DISCOUNTS.mensagem_4,
      ]

      mensagens.forEach((mensagem) => {
        expect(mensagem.description).toContain('41 caracteres')
      })
    })
  })

  describe('Campos do 2º desconto', () => {
    test('deve ter data limite do 2º desconto na posição 322-327 com formato DDMMAA', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_2.pos).toEqual([322, 327])
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_2.type).toBe('data')
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_2.size).toBe(6)
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_2.dateFormat).toBe('DDMMAA')
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_2.required).toBe(false)
    })

    test('deve ter valor do 2º desconto na posição 328-340 com 2 decimals', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_2.pos).toEqual([328, 340])
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_2.type).toBe('num')
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_2.size).toBe(13)
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_2.decimals).toBe(2)
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_2.required).toBe(false)
    })
  })

  describe('Campos do 3º desconto', () => {
    test('deve ter data limite do 3º desconto na posição 341-346 com formato DDMMAA', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_3.pos).toEqual([341, 346])
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_3.type).toBe('data')
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_3.size).toBe(6)
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_3.dateFormat).toBe('DDMMAA')
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_3.required).toBe(false)
    })

    test('deve ter valor do 3º desconto na posição 347-359 com 2 decimals', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_3.pos).toEqual([347, 359])
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_3.type).toBe('num')
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_3.size).toBe(13)
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_3.decimals).toBe(2)
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_3.required).toBe(false)
    })
  })

  describe('Campos de identificação', () => {
    test('deve ter campo reserva na posição 360-366', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.reserva.pos).toEqual([360, 366])
      expect(TYPE2_MESSAGES_DISCOUNTS.reserva.type).toBe('alfa')
      expect(TYPE2_MESSAGES_DISCOUNTS.reserva.size).toBe(7)
      expect(TYPE2_MESSAGES_DISCOUNTS.reserva.required).toBe(false)
    })

    test('deve ter carteira na posição 367-369', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.carteira.pos).toEqual([367, 369])
      expect(TYPE2_MESSAGES_DISCOUNTS.carteira.type).toBe('num')
      expect(TYPE2_MESSAGES_DISCOUNTS.carteira.size).toBe(3)
      expect(TYPE2_MESSAGES_DISCOUNTS.carteira.required).toBe(true)
    })

    test('deve ter agência na posição 370-374', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.agencia.pos).toEqual([370, 374])
      expect(TYPE2_MESSAGES_DISCOUNTS.agencia.type).toBe('num')
      expect(TYPE2_MESSAGES_DISCOUNTS.agencia.size).toBe(5)
      expect(TYPE2_MESSAGES_DISCOUNTS.agencia.required).toBe(true)
    })

    test('deve ter conta na posição 375-381', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.conta.pos).toEqual([375, 381])
      expect(TYPE2_MESSAGES_DISCOUNTS.conta.type).toBe('num')
      expect(TYPE2_MESSAGES_DISCOUNTS.conta.size).toBe(7)
      expect(TYPE2_MESSAGES_DISCOUNTS.conta.required).toBe(true)
    })

    test('deve ter DAC da conta na posição 382', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_conta.pos).toEqual([382, 382])
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_conta.type).toBe('alfa')
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_conta.size).toBe(1)
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_conta.required).toBe(true)
    })

    test('deve ter nosso número na posição 383-393', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.nosso_numero.pos).toEqual([383, 393])
      expect(TYPE2_MESSAGES_DISCOUNTS.nosso_numero.type).toBe('num')
      expect(TYPE2_MESSAGES_DISCOUNTS.nosso_numero.size).toBe(11)
      expect(TYPE2_MESSAGES_DISCOUNTS.nosso_numero.required).toBe(true)
    })

    test('deve ter DAC do nosso número na posição 394', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_nosso_numero.pos).toEqual([394, 394])
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_nosso_numero.type).toBe('alfa')
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_nosso_numero.size).toBe(1)
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_nosso_numero.required).toBe(true)
    })

    test('campos de identificação devem mencionar que precisam coincidir com o registro tipo 1', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.carteira.description).toContain('coincidir')
      expect(TYPE2_MESSAGES_DISCOUNTS.agencia.description).toContain('coincidir')
      expect(TYPE2_MESSAGES_DISCOUNTS.conta.description).toContain('coincidir')
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_conta.description).toContain('coincidir')
      expect(TYPE2_MESSAGES_DISCOUNTS.nosso_numero.description).toContain('coincidir')
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_nosso_numero.description).toContain('coincidir')
    })
  })

  describe('Campos finais', () => {
    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE2_MESSAGES_DISCOUNTS.numero_sequencial.type).toBe('num')
      expect(TYPE2_MESSAGES_DISCOUNTS.numero_sequencial.size).toBe(6)
      expect(TYPE2_MESSAGES_DISCOUNTS.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.entries(TYPE2_MESSAGES_DISCOUNTS)
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

    test('size declarado deve bater com posições', () => {
      Object.entries(TYPE2_MESSAGES_DISCOUNTS).forEach(([_, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          const [start, end] = fieldDef.pos
          const calculatedSize = end - start + 1
          expect(fieldDef.size).toBe(calculatedSize)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const lastField = TYPE2_MESSAGES_DISCOUNTS.numero_sequencial
      expect(lastField.pos[1]).toBe(400)
    })

    test('deve ter 17 campos no total', () => {
      const fieldCount = Object.keys(TYPE2_MESSAGES_DISCOUNTS).length
      expect(fieldCount).toBe(17)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro deve ter padrão fixo "2"', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.tipo_registro.pattern).toBe('2')
    })

    test('mensagens devem ocupar exatamente 320 caracteres (4 × 80)', () => {
      const totalMensagens =
        TYPE2_MESSAGES_DISCOUNTS.mensagem_1.size +
        TYPE2_MESSAGES_DISCOUNTS.mensagem_2.size +
        TYPE2_MESSAGES_DISCOUNTS.mensagem_3.size +
        TYPE2_MESSAGES_DISCOUNTS.mensagem_4.size

      expect(totalMensagens).toBe(320)
    })

    test('mensagens devem ocupar as posições 2-321 de forma contígua', () => {
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_1.pos[0]).toBe(2)
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_4.pos[1]).toBe(321)

      // Verificar continuidade
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_1.pos[1] + 1).toBe(
        TYPE2_MESSAGES_DISCOUNTS.mensagem_2.pos[0],
      )
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_2.pos[1] + 1).toBe(
        TYPE2_MESSAGES_DISCOUNTS.mensagem_3.pos[0],
      )
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_3.pos[1] + 1).toBe(
        TYPE2_MESSAGES_DISCOUNTS.mensagem_4.pos[0],
      )
    })

    test('2º e 3º descontos devem ter mesma estrutura (data + valor)', () => {
      // Datas têm mesmo size e formato
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_2.size).toBe(
        TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_3.size,
      )
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_2.dateFormat).toBe(
        TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_3.dateFormat,
      )

      // Valores têm mesmo size e decimals
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_2.size).toBe(
        TYPE2_MESSAGES_DISCOUNTS.valor_desconto_3.size,
      )
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_2.decimals).toBe(
        TYPE2_MESSAGES_DISCOUNTS.valor_desconto_3.decimals,
      )
    })

    test('valores de desconto devem suportar até 99.999.999.999,99', () => {
      const { size, decimals } = TYPE2_MESSAGES_DISCOUNTS.valor_desconto_2
      const maxValue = Math.pow(10, size) - 1
      const maxValueInReais = maxValue / Math.pow(10, decimals)

      expect(maxValueInReais).toBe(99999999999.99)

      // Verificar que o 3º desconto tem o mesmo limite
      const { size: size3, decimals: decimals3 } =
        TYPE2_MESSAGES_DISCOUNTS.valor_desconto_3
      expect(size3).toBe(size)
      expect(decimals3).toBe(decimals)
    })

    test('deve ter campos obrigatórios e opcionais corretos', () => {
      // Obrigatórios
      expect(TYPE2_MESSAGES_DISCOUNTS.tipo_registro.required).toBe(true)
      expect(TYPE2_MESSAGES_DISCOUNTS.carteira.required).toBe(true)
      expect(TYPE2_MESSAGES_DISCOUNTS.agencia.required).toBe(true)
      expect(TYPE2_MESSAGES_DISCOUNTS.conta.required).toBe(true)
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_conta.required).toBe(true)
      expect(TYPE2_MESSAGES_DISCOUNTS.nosso_numero.required).toBe(true)
      expect(TYPE2_MESSAGES_DISCOUNTS.dac_nosso_numero.required).toBe(true)
      expect(TYPE2_MESSAGES_DISCOUNTS.numero_sequencial.required).toBe(true)

      // Opcionais
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_1.required).toBe(false)
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_2.required).toBe(false)
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_3.required).toBe(false)
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_4.required).toBe(false)
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_2.required).toBe(false)
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_2.required).toBe(false)
      expect(TYPE2_MESSAGES_DISCOUNTS.data_limite_desconto_3.required).toBe(false)
      expect(TYPE2_MESSAGES_DISCOUNTS.valor_desconto_3.required).toBe(false)
      expect(TYPE2_MESSAGES_DISCOUNTS.reserva.required).toBe(false)
    })

    test('mensagem_1 deve ser o maior campo único do layout', () => {
      const allSizes = Object.values(TYPE2_MESSAGES_DISCOUNTS).map(
        (field: any) => field.size || 0,
      )
      const maxSize = Math.max(...allSizes)

      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_1.size).toBe(maxSize)
      expect(TYPE2_MESSAGES_DISCOUNTS.mensagem_1.size).toBe(80)
    })
  })
})

