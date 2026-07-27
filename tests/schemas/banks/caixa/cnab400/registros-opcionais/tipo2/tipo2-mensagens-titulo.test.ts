/**
 * Testes do registro Tipo 2 (Mensagens do Título) — Caixa CNAB 400
 *
 * Valida:
 * - Definição de todos os campos
 * - Posições corretas conforme manual oficial 2024
 * - Integridade do schema (sem sobreposição, tamanhos corretos)
 * - Características específicas do registro
 */

import { TYPE2_TITLE_MESSAGES } from '../../../../../../../src/banks/caixa/schemas/cnab400/registros-opcionais/type2-title-messages/type2-title-messages'

describe('Schema Caixa CNAB 400 - Registro Tipo 2 (Mensagens do Título)', () => {
  describe('Campos de controle', () => {
    test('deve ter código de registro "2" na posição 1', () => {
      expect(TYPE2_TITLE_MESSAGES.codigo_registro.pos).toEqual([1, 1])
      expect(TYPE2_TITLE_MESSAGES.codigo_registro.type).toBe('num')
      expect(TYPE2_TITLE_MESSAGES.codigo_registro.size).toBe(1)
      expect(TYPE2_TITLE_MESSAGES.codigo_registro.pattern).toBe('2')
      expect(TYPE2_TITLE_MESSAGES.codigo_registro.required).toBe(true)
    })

    test('codigo_registro deve indicar na descrição que é inferido', () => {
      const descricao = TYPE2_TITLE_MESSAGES.codigo_registro.description
      expect(descricao.toLowerCase()).toContain('inferido')
    })

    test('deve ter código do banco "104" na posição 140-142', () => {
      expect(TYPE2_TITLE_MESSAGES.codigo_banco.pos).toEqual([140, 142])
      expect(TYPE2_TITLE_MESSAGES.codigo_banco.type).toBe('num')
      expect(TYPE2_TITLE_MESSAGES.codigo_banco.size).toBe(3)
      expect(TYPE2_TITLE_MESSAGES.codigo_banco.pattern).toBe('104')
    })
  })

  describe('Campos de identificação', () => {
    test('deve ter tipo de inscrição da empresa na posição 2-3', () => {
      expect(TYPE2_TITLE_MESSAGES.tipo_inscricao_empresa.pos).toEqual([2, 3])
      expect(TYPE2_TITLE_MESSAGES.tipo_inscricao_empresa.type).toBe('num')
      expect(TYPE2_TITLE_MESSAGES.tipo_inscricao_empresa.size).toBe(2)
    })

    test('deve ter número de inscrição da empresa na posição 4-17', () => {
      expect(TYPE2_TITLE_MESSAGES.numero_inscricao_empresa.pos).toEqual([4, 17])
      expect(TYPE2_TITLE_MESSAGES.numero_inscricao_empresa.type).toBe('num')
      expect(TYPE2_TITLE_MESSAGES.numero_inscricao_empresa.size).toBe(14)
    })

    test('deve ter código da agência na posição 18-21', () => {
      expect(TYPE2_TITLE_MESSAGES.codigo_agencia.pos).toEqual([18, 21])
      expect(TYPE2_TITLE_MESSAGES.codigo_agencia.type).toBe('num')
      expect(TYPE2_TITLE_MESSAGES.codigo_agencia.size).toBe(4)
    })

    test('deve ter código do beneficiário na posição 22-28', () => {
      expect(TYPE2_TITLE_MESSAGES.codigo_beneficiario.pos).toEqual([22, 28])
      expect(TYPE2_TITLE_MESSAGES.codigo_beneficiario.type).toBe('num')
      expect(TYPE2_TITLE_MESSAGES.codigo_beneficiario.size).toBe(7)
    })

    test('deve ter nosso número modalidade na posição 57-58', () => {
      expect(TYPE2_TITLE_MESSAGES.nosso_numero_modalidade.pos).toEqual([57, 58])
      expect(TYPE2_TITLE_MESSAGES.nosso_numero_modalidade.type).toBe('num')
      expect(TYPE2_TITLE_MESSAGES.nosso_numero_modalidade.size).toBe(2)
    })

    test('deve ter nosso número na posição 59-73', () => {
      expect(TYPE2_TITLE_MESSAGES.nosso_numero.pos).toEqual([59, 73])
      expect(TYPE2_TITLE_MESSAGES.nosso_numero.type).toBe('num')
      expect(TYPE2_TITLE_MESSAGES.nosso_numero.size).toBe(15)
    })

    test('deve ter carteira na posição 107-108', () => {
      expect(TYPE2_TITLE_MESSAGES.carteira.pos).toEqual([107, 108])
      expect(TYPE2_TITLE_MESSAGES.carteira.type).toBe('num')
      expect(TYPE2_TITLE_MESSAGES.carteira.size).toBe(2)
    })

    test('deve ter código de ocorrência na posição 109-110', () => {
      expect(TYPE2_TITLE_MESSAGES.codigo_ocorrencia.pos).toEqual([109, 110])
      expect(TYPE2_TITLE_MESSAGES.codigo_ocorrencia.type).toBe('num')
      expect(TYPE2_TITLE_MESSAGES.codigo_ocorrencia.size).toBe(2)
    })
  })

  describe('Campos de mensagens', () => {
    test('deve ter mensagem 1 na posição 143-182 com 40 caracteres', () => {
      expect(TYPE2_TITLE_MESSAGES.mensagem_1.pos).toEqual([143, 182])
      expect(TYPE2_TITLE_MESSAGES.mensagem_1.type).toBe('alfa')
      expect(TYPE2_TITLE_MESSAGES.mensagem_1.size).toBe(40)
    })

    test('deve ter mensagem 2 na posição 183-222 com 40 caracteres', () => {
      expect(TYPE2_TITLE_MESSAGES.mensagem_2.pos).toEqual([183, 222])
      expect(TYPE2_TITLE_MESSAGES.mensagem_2.type).toBe('alfa')
      expect(TYPE2_TITLE_MESSAGES.mensagem_2.size).toBe(40)
    })

    test('deve ter mensagem 3 na posição 223-262 com 40 caracteres', () => {
      expect(TYPE2_TITLE_MESSAGES.mensagem_3.pos).toEqual([223, 262])
      expect(TYPE2_TITLE_MESSAGES.mensagem_3.type).toBe('alfa')
      expect(TYPE2_TITLE_MESSAGES.mensagem_3.size).toBe(40)
    })

    test('deve ter mensagem 4 na posição 263-302 com 40 caracteres', () => {
      expect(TYPE2_TITLE_MESSAGES.mensagem_4.pos).toEqual([263, 302])
      expect(TYPE2_TITLE_MESSAGES.mensagem_4.type).toBe('alfa')
      expect(TYPE2_TITLE_MESSAGES.mensagem_4.size).toBe(40)
    })

    test('deve ter mensagem 5 na posição 303-342 com 40 caracteres', () => {
      expect(TYPE2_TITLE_MESSAGES.mensagem_5.pos).toEqual([303, 342])
      expect(TYPE2_TITLE_MESSAGES.mensagem_5.type).toBe('alfa')
      expect(TYPE2_TITLE_MESSAGES.mensagem_5.size).toBe(40)
    })

    test('deve ter mensagem 6 na posição 343-382 com 40 caracteres', () => {
      expect(TYPE2_TITLE_MESSAGES.mensagem_6.pos).toEqual([343, 382])
      expect(TYPE2_TITLE_MESSAGES.mensagem_6.type).toBe('alfa')
      expect(TYPE2_TITLE_MESSAGES.mensagem_6.size).toBe(40)
    })

    test('todas as 6 mensagens devem ter o mesmo tamanho (40 caracteres)', () => {
      expect(TYPE2_TITLE_MESSAGES.mensagem_1.size).toBe(40)
      expect(TYPE2_TITLE_MESSAGES.mensagem_2.size).toBe(40)
      expect(TYPE2_TITLE_MESSAGES.mensagem_3.size).toBe(40)
      expect(TYPE2_TITLE_MESSAGES.mensagem_4.size).toBe(40)
      expect(TYPE2_TITLE_MESSAGES.mensagem_5.size).toBe(40)
      expect(TYPE2_TITLE_MESSAGES.mensagem_6.size).toBe(40)
    })
  })

  describe('Campos finais', () => {
    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE2_TITLE_MESSAGES.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE2_TITLE_MESSAGES.numero_sequencial.type).toBe('num')
      expect(TYPE2_TITLE_MESSAGES.numero_sequencial.size).toBe(6)
      expect(TYPE2_TITLE_MESSAGES.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.entries(TYPE2_TITLE_MESSAGES)
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
      Object.entries(TYPE2_TITLE_MESSAGES).forEach(([_, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          const [start, end] = fieldDef.pos
          const calculatedSize = end - start + 1
          expect(fieldDef.size).toBe(calculatedSize)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const lastField = TYPE2_TITLE_MESSAGES.numero_sequencial
      expect(lastField.pos[1]).toBe(400)
    })

    test('deve ter 22 campos no total', () => {
      const fieldCount = Object.keys(TYPE2_TITLE_MESSAGES).length
      expect(fieldCount).toBe(22)
    })
  })

  describe('Características específicas', () => {
    test('codigo_registro e codigo_banco devem ter padrões fixos', () => {
      expect(TYPE2_TITLE_MESSAGES.codigo_registro.pattern).toBe('2')
      expect(TYPE2_TITLE_MESSAGES.codigo_banco.pattern).toBe('104')
    })

    test('deve ter campos obrigatórios e opcionais corretos', () => {
      expect(TYPE2_TITLE_MESSAGES.codigo_registro.required).toBe(true)
      expect(TYPE2_TITLE_MESSAGES.numero_sequencial.required).toBe(true)

      // Todos os outros campos devem ser opcionais
      expect(TYPE2_TITLE_MESSAGES.tipo_inscricao_empresa.required).toBe(false)
      expect(TYPE2_TITLE_MESSAGES.codigo_agencia.required).toBe(false)
      expect(TYPE2_TITLE_MESSAGES.mensagem_1.required).toBe(false)
      expect(TYPE2_TITLE_MESSAGES.mensagem_6.required).toBe(false)
    })

    test('deve ter campos de uso exclusivo CAIXA', () => {
      expect(TYPE2_TITLE_MESSAGES.uso_exclusivo_1).toBeDefined()
      expect(TYPE2_TITLE_MESSAGES.uso_exclusivo_2).toBeDefined()
      expect(TYPE2_TITLE_MESSAGES.uso_exclusivo_3).toBeDefined()

      expect(TYPE2_TITLE_MESSAGES.uso_exclusivo_1.pos).toEqual([29, 31])
      expect(TYPE2_TITLE_MESSAGES.uso_exclusivo_2.pos).toEqual([111, 139])
      expect(TYPE2_TITLE_MESSAGES.uso_exclusivo_3.pos).toEqual([383, 394])
    })

    test('deve ter campos brancos', () => {
      expect(TYPE2_TITLE_MESSAGES.brancos_1).toBeDefined()
      expect(TYPE2_TITLE_MESSAGES.brancos_2).toBeDefined()

      expect(TYPE2_TITLE_MESSAGES.brancos_1.pos).toEqual([32, 56])
      expect(TYPE2_TITLE_MESSAGES.brancos_2.pos).toEqual([74, 106])
    })
  })
})
