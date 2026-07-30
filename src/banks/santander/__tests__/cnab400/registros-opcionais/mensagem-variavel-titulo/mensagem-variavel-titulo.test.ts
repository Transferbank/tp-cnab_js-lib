/**
 * Testes do registro Mensagem Variável por Título (Tipos 2/4/5/6/7) — Santander CNAB 400
 *
 * Valida:
 * - Definição de todos os campos
 * - Posições corretas conforme manual oficial 2025 v2.36
 * - Integridade do schema (sem sobreposição, tamanhos corretos)
 * - Características específicas do registro
 */

import { VARIABLE_TITLE_MESSAGE } from '@banks/santander/schemas/cnab400/registros-opcionais/variable-title-message/variable-title-message'

describe('Schema Santander CNAB 400 - Registros Tipo 2/4/5/6/7 (Mensagem Variável)', () => {
  describe('Campos de controle', () => {
    test('deve ter código de registro na posição 1 sem padrão fixo', () => {
      expect(VARIABLE_TITLE_MESSAGE.codigo_registro.pos).toEqual([1, 1])
      expect(VARIABLE_TITLE_MESSAGE.codigo_registro.type).toBe('num')
      expect(VARIABLE_TITLE_MESSAGE.codigo_registro.size).toBe(1)
      expect(VARIABLE_TITLE_MESSAGE.codigo_registro.pattern).toBeNull()
      expect(VARIABLE_TITLE_MESSAGE.codigo_registro.required).toBe(true)
    })

    test('codigo_registro deve explicar que é variável (2/4/5/6/7)', () => {
      const descricao = VARIABLE_TITLE_MESSAGE.codigo_registro.description
      expect(descricao).toContain('2=')
      expect(descricao).toContain('4')
      expect(descricao).toContain('5')
      expect(descricao).toContain('6')
      expect(descricao).toContain('7')
    })
  })

  describe('Campos de identificação', () => {
    test('deve ter reservado_1 na posição 2-17', () => {
      expect(VARIABLE_TITLE_MESSAGE.reservado_1.pos).toEqual([2, 17])
      expect(VARIABLE_TITLE_MESSAGE.reservado_1.type).toBe('alfa')
      expect(VARIABLE_TITLE_MESSAGE.reservado_1.size).toBe(16)
    })

    test('deve ter código da agência na posição 18-21', () => {
      expect(VARIABLE_TITLE_MESSAGE.codigo_agencia.pos).toEqual([18, 21])
      expect(VARIABLE_TITLE_MESSAGE.codigo_agencia.type).toBe('num')
      expect(VARIABLE_TITLE_MESSAGE.codigo_agencia.size).toBe(4)
    })

    test('deve ter conta movimento na posição 22-29', () => {
      expect(VARIABLE_TITLE_MESSAGE.conta_movimento.pos).toEqual([22, 29])
      expect(VARIABLE_TITLE_MESSAGE.conta_movimento.type).toBe('num')
      expect(VARIABLE_TITLE_MESSAGE.conta_movimento.size).toBe(8)
    })

    test('deve ter conta cobrança na posição 30-37', () => {
      expect(VARIABLE_TITLE_MESSAGE.conta_cobranca.pos).toEqual([30, 37])
      expect(VARIABLE_TITLE_MESSAGE.conta_cobranca.type).toBe('num')
      expect(VARIABLE_TITLE_MESSAGE.conta_cobranca.size).toBe(8)
    })

    test('deve ter reservado_2 na posição 38-47', () => {
      expect(VARIABLE_TITLE_MESSAGE.reservado_2.pos).toEqual([38, 47])
      expect(VARIABLE_TITLE_MESSAGE.reservado_2.type).toBe('alfa')
      expect(VARIABLE_TITLE_MESSAGE.reservado_2.size).toBe(10)
    })
  })

  describe('Bloco 1 de mensagem', () => {
    test('deve ter subsequencia_1 na posição 48-49 com padrão "01"', () => {
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_1.pos).toEqual([48, 49])
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_1.type).toBe('num')
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_1.size).toBe(2)
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_1.pattern).toBe('01')
    })

    test('deve ter mensagem_1 na posição 50-99 com 50 caracteres', () => {
      expect(VARIABLE_TITLE_MESSAGE.mensagem_1.pos).toEqual([50, 99])
      expect(VARIABLE_TITLE_MESSAGE.mensagem_1.type).toBe('alfa')
      expect(VARIABLE_TITLE_MESSAGE.mensagem_1.size).toBe(50)
    })
  })

  describe('Bloco 2 de mensagem', () => {
    test('deve ter subsequencia_2 na posição 100-101 com padrão "02"', () => {
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_2.pos).toEqual([100, 101])
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_2.type).toBe('num')
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_2.size).toBe(2)
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_2.pattern).toBe('02')
    })

    test('deve ter mensagem_2 na posição 102-151 com 50 caracteres', () => {
      expect(VARIABLE_TITLE_MESSAGE.mensagem_2.pos).toEqual([102, 151])
      expect(VARIABLE_TITLE_MESSAGE.mensagem_2.type).toBe('alfa')
      expect(VARIABLE_TITLE_MESSAGE.mensagem_2.size).toBe(50)
    })
  })

  describe('Bloco 3 de mensagem', () => {
    test('deve ter subsequencia_3 na posição 152-153 SEM padrão fixo', () => {
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_3.pos).toEqual([152, 153])
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_3.type).toBe('num')
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_3.size).toBe(2)
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_3.pattern).toBeNull()
    })

    test('subsequencia_3 deve mencionar inconsistência do manual na descrição', () => {
      const descricao = VARIABLE_TITLE_MESSAGE.subsequencia_3.description
      expect(descricao).toContain("'02'")
      expect(descricao.toLowerCase()).toContain('manual')
      expect(descricao.toLowerCase()).toContain('repetido')
    })

    test('deve ter mensagem_3 na posição 154-203 com 50 caracteres', () => {
      expect(VARIABLE_TITLE_MESSAGE.mensagem_3.pos).toEqual([154, 203])
      expect(VARIABLE_TITLE_MESSAGE.mensagem_3.type).toBe('alfa')
      expect(VARIABLE_TITLE_MESSAGE.mensagem_3.size).toBe(50)
    })
  })

  describe('Campos finais', () => {
    test('deve ter reservado_3 na posição 204-382 com 179 caracteres', () => {
      expect(VARIABLE_TITLE_MESSAGE.reservado_3.pos).toEqual([204, 382])
      expect(VARIABLE_TITLE_MESSAGE.reservado_3.type).toBe('alfa')
      expect(VARIABLE_TITLE_MESSAGE.reservado_3.size).toBe(179)
    })

    test('deve ter identificador_complemento na posição 383', () => {
      expect(VARIABLE_TITLE_MESSAGE.identificador_complemento.pos).toEqual([383, 383])
      expect(VARIABLE_TITLE_MESSAGE.identificador_complemento.type).toBe('alfa')
      expect(VARIABLE_TITLE_MESSAGE.identificador_complemento.size).toBe(1)
    })

    test('deve ter complemento na posição 384-385', () => {
      expect(VARIABLE_TITLE_MESSAGE.complemento.pos).toEqual([384, 385])
      expect(VARIABLE_TITLE_MESSAGE.complemento.type).toBe('num')
      expect(VARIABLE_TITLE_MESSAGE.complemento.size).toBe(2)
    })

    test('identificador_complemento e complemento devem mencionar nota 2 do manual', () => {
      expect(VARIABLE_TITLE_MESSAGE.identificador_complemento.description).toContain(
        'nota 2',
      )
      expect(VARIABLE_TITLE_MESSAGE.complemento.description).toContain('nota 2')
    })

    test('deve ter reservado_4 na posição 386-394 com 9 caracteres', () => {
      expect(VARIABLE_TITLE_MESSAGE.reservado_4.pos).toEqual([386, 394])
      expect(VARIABLE_TITLE_MESSAGE.reservado_4.type).toBe('alfa')
      expect(VARIABLE_TITLE_MESSAGE.reservado_4.size).toBe(9)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(VARIABLE_TITLE_MESSAGE.numero_sequencial.pos).toEqual([395, 400])
      expect(VARIABLE_TITLE_MESSAGE.numero_sequencial.type).toBe('num')
      expect(VARIABLE_TITLE_MESSAGE.numero_sequencial.size).toBe(6)
      expect(VARIABLE_TITLE_MESSAGE.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.entries(VARIABLE_TITLE_MESSAGE)
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
      Object.entries(VARIABLE_TITLE_MESSAGE).forEach(([_, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          const [start, end] = fieldDef.pos
          const calculatedSize = end - start + 1
          expect(fieldDef.size).toBe(calculatedSize)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const lastField = VARIABLE_TITLE_MESSAGE.numero_sequencial
      expect(lastField.pos[1]).toBe(400)
    })

    test('deve ter 17 campos no total', () => {
      const fieldCount = Object.keys(VARIABLE_TITLE_MESSAGE).length
      expect(fieldCount).toBe(17)
    })
  })

  describe('Características específicas', () => {
    test('deve ter apenas 2 campos obrigatórios', () => {
      expect(VARIABLE_TITLE_MESSAGE.codigo_registro.required).toBe(true)
      expect(VARIABLE_TITLE_MESSAGE.numero_sequencial.required).toBe(true)

      // Todos os outros devem ser opcionais
      expect(VARIABLE_TITLE_MESSAGE.reservado_1.required).toBe(false)
      expect(VARIABLE_TITLE_MESSAGE.codigo_agencia.required).toBe(false)
      expect(VARIABLE_TITLE_MESSAGE.mensagem_1.required).toBe(false)
      expect(VARIABLE_TITLE_MESSAGE.mensagem_2.required).toBe(false)
      expect(VARIABLE_TITLE_MESSAGE.mensagem_3.required).toBe(false)
    })

    test('campo reservado_3 deve ser o maior campo (179 caracteres)', () => {
      expect(VARIABLE_TITLE_MESSAGE.reservado_3.size).toBe(179)

      // Verificar que é o maior campo
      const allSizes = Object.values(VARIABLE_TITLE_MESSAGE).map(
        (field: any) => field.size || 0,
      )
      const maxSize = Math.max(...allSizes)
      expect(VARIABLE_TITLE_MESSAGE.reservado_3.size).toBe(maxSize)
    })

    test('deve ter 3 blocos de mensagem de 50 caracteres cada', () => {
      expect(VARIABLE_TITLE_MESSAGE.mensagem_1.size).toBe(50)
      expect(VARIABLE_TITLE_MESSAGE.mensagem_2.size).toBe(50)
      expect(VARIABLE_TITLE_MESSAGE.mensagem_3.size).toBe(50)
    })

    test('deve ter 3 marcadores de subsequência', () => {
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_1.size).toBe(2)
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_2.size).toBe(2)
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_3.size).toBe(2)
    })

    test('subsequencias 1 e 2 devem ter padrões fixos, mas 3 não', () => {
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_1.pattern).toBe('01')
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_2.pattern).toBe('02')
      expect(VARIABLE_TITLE_MESSAGE.subsequencia_3.pattern).toBeNull()
    })

    test('deve ter 4 campos reservados (uso banco)', () => {
      expect(VARIABLE_TITLE_MESSAGE.reservado_1).toBeDefined()
      expect(VARIABLE_TITLE_MESSAGE.reservado_2).toBeDefined()
      expect(VARIABLE_TITLE_MESSAGE.reservado_3).toBeDefined()
      expect(VARIABLE_TITLE_MESSAGE.reservado_4).toBeDefined()
    })

    test('codigo_agencia, conta_movimento e conta_cobranca devem somar 20 caracteres', () => {
      const total =
        VARIABLE_TITLE_MESSAGE.codigo_agencia.size +
        VARIABLE_TITLE_MESSAGE.conta_movimento.size +
        VARIABLE_TITLE_MESSAGE.conta_cobranca.size
      expect(total).toBe(20)
    })

    test('codigo_registro não deve ter padrão fixo (variável entre 2/4/5/6/7)', () => {
      expect(VARIABLE_TITLE_MESSAGE.codigo_registro.pattern).toBeNull()
    })
  })
})

