/**
 * Testes do registro Tipo 3 (Envio por E-mail/SMS) — Caixa CNAB 400
 *
 * Valida:
 * - Definição de todos os campos
 * - Posições corretas conforme manual oficial 2024
 * - Integridade do schema (sem sobreposição, tamanhos corretos)
 * - Características específicas do registro
 */

import { TYPE3_EMAIL_SMS } from '@banks/caixa/schemas/cnab400/registros-opcionais/type3-email-sms/type3-email-sms'

describe('Schema Caixa CNAB 400 - Registro Tipo 3 (Envio por E-mail/SMS)', () => {
  describe('Campos de controle', () => {
    test('deve ter código de registro "3" na posição 1', () => {
      expect(TYPE3_EMAIL_SMS.codigo_registro.pos).toEqual([1, 1])
      expect(TYPE3_EMAIL_SMS.codigo_registro.type).toBe('num')
      expect(TYPE3_EMAIL_SMS.codigo_registro.size).toBe(1)
      expect(TYPE3_EMAIL_SMS.codigo_registro.pattern).toBe('3')
      expect(TYPE3_EMAIL_SMS.codigo_registro.required).toBe(true)
    })

    test('codigo_registro deve indicar na descrição que é inferido', () => {
      const descricao = TYPE3_EMAIL_SMS.codigo_registro.description
      expect(descricao.toLowerCase()).toContain('inferido')
    })
  })

  describe('Campos de identificação', () => {
    test('deve ter tipo de inscrição da empresa na posição 2-3', () => {
      expect(TYPE3_EMAIL_SMS.tipo_inscricao_empresa.pos).toEqual([2, 3])
      expect(TYPE3_EMAIL_SMS.tipo_inscricao_empresa.type).toBe('num')
      expect(TYPE3_EMAIL_SMS.tipo_inscricao_empresa.size).toBe(2)
    })

    test('deve ter número de inscrição da empresa na posição 4-17', () => {
      expect(TYPE3_EMAIL_SMS.numero_inscricao_empresa.pos).toEqual([4, 17])
      expect(TYPE3_EMAIL_SMS.numero_inscricao_empresa.type).toBe('num')
      expect(TYPE3_EMAIL_SMS.numero_inscricao_empresa.size).toBe(14)
    })

    test('deve ter código da agência na posição 18-21', () => {
      expect(TYPE3_EMAIL_SMS.codigo_agencia.pos).toEqual([18, 21])
      expect(TYPE3_EMAIL_SMS.codigo_agencia.type).toBe('num')
      expect(TYPE3_EMAIL_SMS.codigo_agencia.size).toBe(4)
    })

    test('deve ter código do beneficiário na posição 22-28', () => {
      expect(TYPE3_EMAIL_SMS.codigo_beneficiario.pos).toEqual([22, 28])
      expect(TYPE3_EMAIL_SMS.codigo_beneficiario.type).toBe('num')
      expect(TYPE3_EMAIL_SMS.codigo_beneficiario.size).toBe(7)
    })
  })

  describe('Campos de contato', () => {
    test('deve ter dados do destinatário (e-mail) na posição 54-103 com 50 caracteres', () => {
      expect(TYPE3_EMAIL_SMS.dados_destinatario.pos).toEqual([54, 103])
      expect(TYPE3_EMAIL_SMS.dados_destinatario.type).toBe('alfa')
      expect(TYPE3_EMAIL_SMS.dados_destinatario.size).toBe(50)
      expect(TYPE3_EMAIL_SMS.dados_destinatario.required).toBe(false)
    })

    test('deve ter código DDD na posição 104-105', () => {
      expect(TYPE3_EMAIL_SMS.codigo_ddd.pos).toEqual([104, 105])
      expect(TYPE3_EMAIL_SMS.codigo_ddd.type).toBe('alfa')
      expect(TYPE3_EMAIL_SMS.codigo_ddd.size).toBe(2)
    })

    test('deve ter número do celular na posição 106-114 com 9 caracteres', () => {
      expect(TYPE3_EMAIL_SMS.numero_celular.pos).toEqual([106, 114])
      expect(TYPE3_EMAIL_SMS.numero_celular.type).toBe('alfa')
      expect(TYPE3_EMAIL_SMS.numero_celular.size).toBe(9)
    })

    test('deve ter tipo de mensagem SMS na posição 115', () => {
      expect(TYPE3_EMAIL_SMS.tipo_mensagem_sms.pos).toEqual([115, 115])
      expect(TYPE3_EMAIL_SMS.tipo_mensagem_sms.type).toBe('alfa')
      expect(TYPE3_EMAIL_SMS.tipo_mensagem_sms.size).toBe(1)
    })

    test('tipo_mensagem_sms deve mencionar NE060 na descrição', () => {
      const descricao = TYPE3_EMAIL_SMS.tipo_mensagem_sms.description
      expect(descricao).toContain('NE060')
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos_2 na posição 116-394 com 279 caracteres', () => {
      expect(TYPE3_EMAIL_SMS.brancos_2.pos).toEqual([116, 394])
      expect(TYPE3_EMAIL_SMS.brancos_2.type).toBe('alfa')
      expect(TYPE3_EMAIL_SMS.brancos_2.size).toBe(279)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE3_EMAIL_SMS.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE3_EMAIL_SMS.numero_sequencial.type).toBe('num')
      expect(TYPE3_EMAIL_SMS.numero_sequencial.size).toBe(6)
      expect(TYPE3_EMAIL_SMS.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.entries(TYPE3_EMAIL_SMS)
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
      Object.entries(TYPE3_EMAIL_SMS).forEach(([_, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          const [start, end] = fieldDef.pos
          const calculatedSize = end - start + 1
          expect(fieldDef.size).toBe(calculatedSize)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const lastField = TYPE3_EMAIL_SMS.numero_sequencial
      expect(lastField.pos[1]).toBe(400)
    })

    test('deve ter 12 campos no total', () => {
      const fieldCount = Object.keys(TYPE3_EMAIL_SMS).length
      expect(fieldCount).toBe(12)
    })
  })

  describe('Características específicas', () => {
    test('codigo_registro deve ter padrão fixo "3"', () => {
      expect(TYPE3_EMAIL_SMS.codigo_registro.pattern).toBe('3')
    })

    test('deve ter campos obrigatórios e opcionais corretos', () => {
      expect(TYPE3_EMAIL_SMS.codigo_registro.required).toBe(true)
      expect(TYPE3_EMAIL_SMS.numero_sequencial.required).toBe(true)

      // Todos os outros campos devem ser opcionais
      expect(TYPE3_EMAIL_SMS.tipo_inscricao_empresa.required).toBe(false)
      expect(TYPE3_EMAIL_SMS.dados_destinatario.required).toBe(false)
      expect(TYPE3_EMAIL_SMS.codigo_ddd.required).toBe(false)
      expect(TYPE3_EMAIL_SMS.numero_celular.required).toBe(false)
    })

    test('campo brancos_2 deve ser o maior campo (279 caracteres)', () => {
      expect(TYPE3_EMAIL_SMS.brancos_2.size).toBe(279)

      // Verificar que é o maior campo
      const allSizes = Object.values(TYPE3_EMAIL_SMS).map(
        (field: any) => field.size || 0,
      )
      const maxSize = Math.max(...allSizes)
      expect(TYPE3_EMAIL_SMS.brancos_2.size).toBe(maxSize)
    })

    test('campos de telefone (DDD e celular) devem ser alfa, não numéricos', () => {
      expect(TYPE3_EMAIL_SMS.codigo_ddd.type).toBe('alfa')
      expect(TYPE3_EMAIL_SMS.numero_celular.type).toBe('alfa')
    })

    test('e-mail deve ter 50 caracteres disponíveis', () => {
      expect(TYPE3_EMAIL_SMS.dados_destinatario.size).toBe(50)
    })
  })
})

