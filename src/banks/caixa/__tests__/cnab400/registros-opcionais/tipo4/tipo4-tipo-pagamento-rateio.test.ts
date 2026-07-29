/**
 * Testes do registro Tipo 4 (Tipo de Pagamento e Rateio) — Caixa CNAB 400
 *
 * Valida:
 * - Definição de todos os campos
 * - Posições corretas conforme manual oficial 2024
 * - Integridade do schema (sem sobreposição, tamanhos corretos)
 * - Características específicas do registro
 */

import { TYPE4_PAYMENT_ALLOCATION } from '@banks/caixa/schemas/cnab400/registros-opcionais/type4-payment-allocation/type4-payment-allocation'

describe('Schema Caixa CNAB 400 - Registro Tipo 4 (Tipo de Pagamento e Rateio)', () => {
  describe('Campos de controle', () => {
    test('deve ter código de registro "4" na posição 1', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_registro.pos).toEqual([1, 1])
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_registro.type).toBe('num')
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_registro.size).toBe(1)
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_registro.pattern).toBe('4')
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_registro.required).toBe(true)
    })

    test('codigo_registro deve indicar na descrição que é inferido', () => {
      const descricao = TYPE4_PAYMENT_ALLOCATION.codigo_registro.description
      expect(descricao.toLowerCase()).toContain('inferido')
    })
  })

  describe('Campos de identificação', () => {
    test('deve ter tipo de inscrição da empresa na posição 2-3', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_inscricao_empresa.pos).toEqual([2, 3])
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_inscricao_empresa.type).toBe('num')
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_inscricao_empresa.size).toBe(2)
    })

    test('deve ter código da agência na posição 18-21', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_agencia.pos).toEqual([18, 21])
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_agencia.size).toBe(4)
    })

    test('deve ter código do beneficiário na posição 22-28', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_beneficiario.pos).toEqual([22, 28])
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_beneficiario.size).toBe(7)
    })
  })

  describe('Campos de tipo de pagamento', () => {
    test('deve ter codigo_registro_opcional na posição 57-58', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_registro_opcional.pos).toEqual([57, 58])
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_registro_opcional.type).toBe('num')
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_registro_opcional.size).toBe(2)
    })

    test('deve ter tipo_pagamento na posição 59-60', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_pagamento.pos).toEqual([59, 60])
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_pagamento.type).toBe('num')
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_pagamento.size).toBe(2)
    })

    test('deve ter quantidade_pagamentos_possiveis na posição 61-62', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.quantidade_pagamentos_possiveis.pos).toEqual([
        61, 62,
      ])
      expect(TYPE4_PAYMENT_ALLOCATION.quantidade_pagamentos_possiveis.size).toBe(2)
    })

    test('deve ter valor_nominal_titulo na posição 63-77 com 15 caracteres', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.valor_nominal_titulo.pos).toEqual([63, 77])
      expect(TYPE4_PAYMENT_ALLOCATION.valor_nominal_titulo.size).toBe(15)
    })
  })

  describe('Campos de valor máximo', () => {
    test('deve ter tipo_valor_maximo na posição 78', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_valor_maximo.pos).toEqual([78, 78])
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_valor_maximo.size).toBe(1)
    })

    test('deve ter valor_maximo na posição 79-93', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.valor_maximo.pos).toEqual([79, 93])
      expect(TYPE4_PAYMENT_ALLOCATION.valor_maximo.size).toBe(15)
    })

    test('deve ter percentual_maximo na posição 94-108', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.percentual_maximo.pos).toEqual([94, 108])
      expect(TYPE4_PAYMENT_ALLOCATION.percentual_maximo.size).toBe(15)
    })
  })

  describe('Campos de valor mínimo', () => {
    test('deve ter tipo_valor_minimo na posição 109', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_valor_minimo.pos).toEqual([109, 109])
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_valor_minimo.size).toBe(1)
    })

    test('deve ter valor_minimo na posição 110-124', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.valor_minimo.pos).toEqual([110, 124])
      expect(TYPE4_PAYMENT_ALLOCATION.valor_minimo.size).toBe(15)
    })

    test('deve ter percentual_minimo na posição 125-139', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.percentual_minimo.pos).toEqual([125, 139])
      expect(TYPE4_PAYMENT_ALLOCATION.percentual_minimo.size).toBe(15)
    })
  })

  describe('Campos de crédito do beneficiário', () => {
    test('deve ter agencia_credito_beneficiario na posição 143-147', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.agencia_credito_beneficiario.pos).toEqual([
        143, 147,
      ])
      expect(TYPE4_PAYMENT_ALLOCATION.agencia_credito_beneficiario.size).toBe(5)
    })

    test('deve ter dv_agencia_credito na posição 148', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.dv_agencia_credito.pos).toEqual([148, 148])
      expect(TYPE4_PAYMENT_ALLOCATION.dv_agencia_credito.type).toBe('alfa')
      expect(TYPE4_PAYMENT_ALLOCATION.dv_agencia_credito.size).toBe(1)
    })

    test('deve ter conta_credito_beneficiario na posição 149-160', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.conta_credito_beneficiario.pos).toEqual([
        149, 160,
      ])
      expect(TYPE4_PAYMENT_ALLOCATION.conta_credito_beneficiario.size).toBe(12)
    })

    test('deve ter dv_conta_credito na posição 161', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.dv_conta_credito.pos).toEqual([161, 161])
      expect(TYPE4_PAYMENT_ALLOCATION.dv_conta_credito.type).toBe('alfa')
      expect(TYPE4_PAYMENT_ALLOCATION.dv_conta_credito.size).toBe(1)
    })

    test('deve ter dv_agencia_conta na posição 162', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.dv_agencia_conta.pos).toEqual([162, 162])
      expect(TYPE4_PAYMENT_ALLOCATION.dv_agencia_conta.type).toBe('alfa')
      expect(TYPE4_PAYMENT_ALLOCATION.dv_agencia_conta.size).toBe(1)
    })
  })

  describe('Campos de rateio', () => {
    test('deve ter codigo_calculo_rateio na posição 183', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_calculo_rateio.pos).toEqual([183, 183])
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_calculo_rateio.size).toBe(1)
    })

    test('codigo_calculo_rateio deve indicar incerteza na descrição', () => {
      const descricao = TYPE4_PAYMENT_ALLOCATION.codigo_calculo_rateio.description
      expect(descricao.toUpperCase()).toContain('INCERTEZA')
    })

    test('deve ter tipo_valor_informado_rateio na posição 184', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_valor_informado_rateio.pos).toEqual([
        184, 184,
      ])
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_valor_informado_rateio.size).toBe(1)
    })

    test('tipo_valor_informado_rateio deve indicar incerteza na descrição', () => {
      const descricao = TYPE4_PAYMENT_ALLOCATION.tipo_valor_informado_rateio.description
      expect(descricao.toUpperCase()).toContain('INCERTEZA')
    })

    test('deve ter valor_ou_percentual_rateio na posição 185-199', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.valor_ou_percentual_rateio.pos).toEqual([
        185, 199,
      ])
      expect(TYPE4_PAYMENT_ALLOCATION.valor_ou_percentual_rateio.size).toBe(15)
    })

    test('deve ter codigo_banco_credito na posição 200-202', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_banco_credito.pos).toEqual([200, 202])
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_banco_credito.size).toBe(3)
    })

    test('deve ter nome_beneficiario na posição 223-262 como alfa', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.nome_beneficiario.pos).toEqual([223, 262])
      expect(TYPE4_PAYMENT_ALLOCATION.nome_beneficiario.type).toBe('alfa')
      expect(TYPE4_PAYMENT_ALLOCATION.nome_beneficiario.size).toBe(40)
    })

    test('nome_beneficiario deve mencionar picture numérico do manual na descrição', () => {
      const descricao = TYPE4_PAYMENT_ALLOCATION.nome_beneficiario.description
      expect(descricao).toContain('9(040)')
      expect(descricao.toLowerCase()).toContain('alfa')
    })

    test('deve ter parcela na posição 263-268', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.parcela.pos).toEqual([263, 268])
      expect(TYPE4_PAYMENT_ALLOCATION.parcela.size).toBe(6)
    })

    test('deve ter floating na posição 269-271', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.floating.pos).toEqual([269, 271])
      expect(TYPE4_PAYMENT_ALLOCATION.floating.size).toBe(3)
    })

    test('deve ter data_credito na posição 272-279', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.data_credito.pos).toEqual([272, 279])
      expect(TYPE4_PAYMENT_ALLOCATION.data_credito.size).toBe(8)
    })

    test('deve ter motivo_ocorrido na posição 280-289', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.motivo_ocorrido.pos).toEqual([280, 289])
      expect(TYPE4_PAYMENT_ALLOCATION.motivo_ocorrido.size).toBe(10)
    })
  })

  describe('Campos finais', () => {
    test('deve ter uso_exclusivo_4 na posição 290-394 com 105 caracteres', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.uso_exclusivo_4.pos).toEqual([290, 394])
      expect(TYPE4_PAYMENT_ALLOCATION.uso_exclusivo_4.type).toBe('alfa')
      expect(TYPE4_PAYMENT_ALLOCATION.uso_exclusivo_4.size).toBe(105)
    })

    test('uso_exclusivo_4 deve mencionar correção de posição na descrição', () => {
      const descricao = TYPE4_PAYMENT_ALLOCATION.uso_exclusivo_4.description
      expect(descricao).toContain('290-394')
      expect(descricao).toContain('289-394')
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE4_PAYMENT_ALLOCATION.numero_sequencial.type).toBe('num')
      expect(TYPE4_PAYMENT_ALLOCATION.numero_sequencial.size).toBe(6)
      expect(TYPE4_PAYMENT_ALLOCATION.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.entries(TYPE4_PAYMENT_ALLOCATION)
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
      Object.entries(TYPE4_PAYMENT_ALLOCATION).forEach(([_, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          const [start, end] = fieldDef.pos
          const calculatedSize = end - start + 1
          expect(fieldDef.size).toBe(calculatedSize)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const lastField = TYPE4_PAYMENT_ALLOCATION.numero_sequencial
      expect(lastField.pos[1]).toBe(400)
    })

    test('deve ter 42 campos no total', () => {
      const fieldCount = Object.keys(TYPE4_PAYMENT_ALLOCATION).length
      expect(fieldCount).toBe(42)
    })
  })

  describe('Características específicas', () => {
    test('codigo_registro deve ter padrão fixo "4"', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_registro.pattern).toBe('4')
    })

    test('deve ter campos obrigatórios e opcionais corretos', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.codigo_registro.required).toBe(true)
      expect(TYPE4_PAYMENT_ALLOCATION.numero_sequencial.required).toBe(true)

      // Todos os outros campos devem ser opcionais
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_inscricao_empresa.required).toBe(false)
      expect(TYPE4_PAYMENT_ALLOCATION.tipo_pagamento.required).toBe(false)
      expect(TYPE4_PAYMENT_ALLOCATION.nome_beneficiario.required).toBe(false)
    })

    test('deve ter 4 campos de uso exclusivo CAIXA', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.uso_exclusivo_1).toBeDefined()
      expect(TYPE4_PAYMENT_ALLOCATION.uso_exclusivo_2).toBeDefined()
      expect(TYPE4_PAYMENT_ALLOCATION.uso_exclusivo_3).toBeDefined()
      expect(TYPE4_PAYMENT_ALLOCATION.uso_exclusivo_4).toBeDefined()
    })

    test('campo uso_exclusivo_4 deve ser o maior campo (105 caracteres)', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.uso_exclusivo_4.size).toBe(105)

      // Verificar que é o maior campo
      const allSizes = Object.values(TYPE4_PAYMENT_ALLOCATION).map(
        (field: any) => field.size || 0,
      )
      const maxSize = Math.max(...allSizes)
      expect(TYPE4_PAYMENT_ALLOCATION.uso_exclusivo_4.size).toBe(maxSize)
    })

    test('deve ter múltiplos campos de 15 caracteres para valores', () => {
      const campos15chars = [
        'valor_nominal_titulo',
        'valor_maximo',
        'percentual_maximo',
        'valor_minimo',
        'percentual_minimo',
        'valor_ou_percentual_rateio',
      ]

      campos15chars.forEach((campo) => {
        expect(TYPE4_PAYMENT_ALLOCATION[campo].size).toBe(15)
      })
    })

    test('deve ter 3 dígitos verificadores para crédito do beneficiário', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.dv_agencia_credito.size).toBe(1)
      expect(TYPE4_PAYMENT_ALLOCATION.dv_conta_credito.size).toBe(1)
      expect(TYPE4_PAYMENT_ALLOCATION.dv_agencia_conta.size).toBe(1)
    })

    test('deve ter 3 dígitos verificadores duplicados para rateio', () => {
      expect(TYPE4_PAYMENT_ALLOCATION.dv_agencia_credito_2.size).toBe(1)
      expect(TYPE4_PAYMENT_ALLOCATION.dv_conta_credito_2.size).toBe(1)
      expect(TYPE4_PAYMENT_ALLOCATION.dv_agencia_conta_2.size).toBe(1)
    })
  })
})

