/**
 * Testes do registro Tipo 8 (Pagamento via PIX/QR Code) — Santander CNAB 400
 *
 * Valida:
 * - Definição de todos os campos
 * - Posições corretas conforme manual oficial 2025 v2.36
 * - Integridade do schema (sem sobreposição, tamanhos corretos)
 * - Características específicas do registro
 */

import { TYPE8_PIX } from '../../../../../../../src/banks/santander/schemas/cnab400/registros-opcionais/type8-pix/type8-pix'

describe('Schema Santander CNAB 400 - Registro Tipo 8 (Pagamento via PIX/QR Code)', () => {
  describe('Campos de controle', () => {
    test('deve ter código de registro "8" na posição 1', () => {
      expect(TYPE8_PIX.codigo_registro.pos).toEqual([1, 1])
      expect(TYPE8_PIX.codigo_registro.type).toBe('num')
      expect(TYPE8_PIX.codigo_registro.size).toBe(1)
      expect(TYPE8_PIX.codigo_registro.pattern).toBe('8')
      expect(TYPE8_PIX.codigo_registro.required).toBe(true)
    })

    test('deve ter tipo de pagamento na posição 2-3 com padrão "00"', () => {
      expect(TYPE8_PIX.tipo_pagamento.pos).toEqual([2, 3])
      expect(TYPE8_PIX.tipo_pagamento.type).toBe('num')
      expect(TYPE8_PIX.tipo_pagamento.size).toBe(2)
      expect(TYPE8_PIX.tipo_pagamento.pattern).toBe('00')
      expect(TYPE8_PIX.tipo_pagamento.required).toBe(true)
    })

    test('tipo_pagamento deve ter descrição com os 4 códigos possíveis', () => {
      const descricao = TYPE8_PIX.tipo_pagamento.description
      expect(descricao).toContain('00=')
      expect(descricao).toContain('01=')
      expect(descricao).toContain('02=')
      expect(descricao).toContain('03=')
    })

    test('deve ter quantidade de pagamentos na posição 4-5 com padrão "01"', () => {
      expect(TYPE8_PIX.quantidade_pagamentos.pos).toEqual([4, 5])
      expect(TYPE8_PIX.quantidade_pagamentos.type).toBe('num')
      expect(TYPE8_PIX.quantidade_pagamentos.size).toBe(2)
      expect(TYPE8_PIX.quantidade_pagamentos.pattern).toBe('01')
      expect(TYPE8_PIX.quantidade_pagamentos.required).toBe(true)
    })

    test('deve ter tipo de valor na posição 6', () => {
      expect(TYPE8_PIX.tipo_valor.pos).toEqual([6, 6])
      expect(TYPE8_PIX.tipo_valor.type).toBe('num')
      expect(TYPE8_PIX.tipo_valor.size).toBe(1)
      expect(TYPE8_PIX.tipo_valor.required).toBe(true)
    })

    test('tipo_valor deve ter descrição explicando 1=percentual e 2=valor', () => {
      const descricao = TYPE8_PIX.tipo_valor.description
      expect(descricao).toContain('1=percentual')
      expect(descricao).toContain('2=valor')
    })
  })

  describe('Campos de valor máximo', () => {
    test('deve ter valor máximo na posição 7-19 com 13 caracteres e 2 decimais', () => {
      expect(TYPE8_PIX.valor_maximo.pos).toEqual([7, 19])
      expect(TYPE8_PIX.valor_maximo.type).toBe('num')
      expect(TYPE8_PIX.valor_maximo.size).toBe(13)
      expect(TYPE8_PIX.valor_maximo.decimals).toBe(2)
      expect(TYPE8_PIX.valor_maximo.required).toBe(false)
    })

    test('deve ter percentual máximo na posição 20-24 com 5 caracteres e 2 decimais', () => {
      expect(TYPE8_PIX.percentual_maximo.pos).toEqual([20, 24])
      expect(TYPE8_PIX.percentual_maximo.type).toBe('num')
      expect(TYPE8_PIX.percentual_maximo.size).toBe(5)
      expect(TYPE8_PIX.percentual_maximo.decimals).toBe(2)
      expect(TYPE8_PIX.percentual_maximo.required).toBe(false)
    })

    test('valor e percentual máximo devem mencionar tipo_pagamento=02 na descrição', () => {
      expect(TYPE8_PIX.valor_maximo.description).toContain("tipo_pagamento='02'")
      expect(TYPE8_PIX.percentual_maximo.description).toContain("tipo_pagamento='02'")
    })
  })

  describe('Campos de valor mínimo', () => {
    test('deve ter valor mínimo na posição 25-37 com 13 caracteres e 2 decimais', () => {
      expect(TYPE8_PIX.valor_minimo.pos).toEqual([25, 37])
      expect(TYPE8_PIX.valor_minimo.type).toBe('num')
      expect(TYPE8_PIX.valor_minimo.size).toBe(13)
      expect(TYPE8_PIX.valor_minimo.decimals).toBe(2)
      expect(TYPE8_PIX.valor_minimo.required).toBe(false)
    })

    test('deve ter percentual mínimo na posição 38-42 com 5 caracteres e 2 decimais', () => {
      expect(TYPE8_PIX.percentual_minimo.pos).toEqual([38, 42])
      expect(TYPE8_PIX.percentual_minimo.type).toBe('num')
      expect(TYPE8_PIX.percentual_minimo.size).toBe(5)
      expect(TYPE8_PIX.percentual_minimo.decimals).toBe(2)
      expect(TYPE8_PIX.percentual_minimo.required).toBe(false)
    })

    test('valor e percentual mínimo devem mencionar tipo_pagamento=02 na descrição', () => {
      expect(TYPE8_PIX.valor_minimo.description).toContain("tipo_pagamento='02'")
      expect(TYPE8_PIX.percentual_minimo.description).toContain("tipo_pagamento='02'")
    })
  })

  describe('Campos de chave DICT', () => {
    test('deve ter tipo de chave DICT na posição 43', () => {
      expect(TYPE8_PIX.tipo_chave_dict.pos).toEqual([43, 43])
      expect(TYPE8_PIX.tipo_chave_dict.type).toBe('alfa')
      expect(TYPE8_PIX.tipo_chave_dict.size).toBe(1)
      expect(TYPE8_PIX.tipo_chave_dict.required).toBe(true)
    })

    test('tipo_chave_dict deve ter descrição com os 5 tipos possíveis', () => {
      const descricao = TYPE8_PIX.tipo_chave_dict.description
      expect(descricao).toContain('1=CPF')
      expect(descricao).toContain('2=CNPJ')
      expect(descricao).toContain('3=Telefone')
      expect(descricao).toContain('4=E-mail')
      expect(descricao).toContain('5=Chave Aleatória')
    })

    test('deve ter código da chave DICT na posição 44-120 com 77 caracteres', () => {
      expect(TYPE8_PIX.codigo_chave_dict.pos).toEqual([44, 120])
      expect(TYPE8_PIX.codigo_chave_dict.type).toBe('alfa')
      expect(TYPE8_PIX.codigo_chave_dict.size).toBe(77)
      expect(TYPE8_PIX.codigo_chave_dict.required).toBe(true)
    })
  })

  describe('Campos finais', () => {
    test('deve ter identificador do QR Code na posição 121-155 com 35 caracteres', () => {
      expect(TYPE8_PIX.identificador_qrcode.pos).toEqual([121, 155])
      expect(TYPE8_PIX.identificador_qrcode.type).toBe('alfa')
      expect(TYPE8_PIX.identificador_qrcode.size).toBe(35)
      expect(TYPE8_PIX.identificador_qrcode.required).toBe(false)
    })

    test('identificador_qrcode deve mencionar TXID e conciliação na descrição', () => {
      const descricao = TYPE8_PIX.identificador_qrcode.description
      expect(descricao.toUpperCase()).toContain('TXID')
      expect(descricao.toLowerCase()).toContain('conciliação')
    })

    test('deve ter reservado na posição 156-394 com 239 caracteres', () => {
      expect(TYPE8_PIX.reservado.pos).toEqual([156, 394])
      expect(TYPE8_PIX.reservado.type).toBe('alfa')
      expect(TYPE8_PIX.reservado.size).toBe(239)
      expect(TYPE8_PIX.reservado.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE8_PIX.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE8_PIX.numero_sequencial.type).toBe('num')
      expect(TYPE8_PIX.numero_sequencial.size).toBe(6)
      expect(TYPE8_PIX.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.entries(TYPE8_PIX)
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
      Object.entries(TYPE8_PIX).forEach(([_, fieldDef]: [string, any]) => {
        if (fieldDef.pos) {
          const [start, end] = fieldDef.pos
          const calculatedSize = end - start + 1
          expect(fieldDef.size).toBe(calculatedSize)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const lastField = TYPE8_PIX.numero_sequencial
      expect(lastField.pos[1]).toBe(400)
    })

    test('deve ter 13 campos no total', () => {
      const fieldCount = Object.keys(TYPE8_PIX).length
      expect(fieldCount).toBe(13)
    })
  })

  describe('Características específicas', () => {
    test('codigo_registro e padrões devem estar corretos', () => {
      expect(TYPE8_PIX.codigo_registro.pattern).toBe('8')
      expect(TYPE8_PIX.tipo_pagamento.pattern).toBe('00')
      expect(TYPE8_PIX.quantidade_pagamentos.pattern).toBe('01')
    })

    test('deve ter campos obrigatórios e opcionais corretos', () => {
      expect(TYPE8_PIX.codigo_registro.required).toBe(true)
      expect(TYPE8_PIX.tipo_pagamento.required).toBe(true)
      expect(TYPE8_PIX.quantidade_pagamentos.required).toBe(true)
      expect(TYPE8_PIX.tipo_valor.required).toBe(true)
      expect(TYPE8_PIX.tipo_chave_dict.required).toBe(true)
      expect(TYPE8_PIX.codigo_chave_dict.required).toBe(true)
      expect(TYPE8_PIX.numero_sequencial.required).toBe(true)

      expect(TYPE8_PIX.valor_maximo.required).toBe(false)
      expect(TYPE8_PIX.percentual_maximo.required).toBe(false)
      expect(TYPE8_PIX.valor_minimo.required).toBe(false)
      expect(TYPE8_PIX.percentual_minimo.required).toBe(false)
      expect(TYPE8_PIX.identificador_qrcode.required).toBe(false)
      expect(TYPE8_PIX.reservado.required).toBe(false)
    })

    test('campo reservado deve ser o maior campo (239 caracteres)', () => {
      expect(TYPE8_PIX.reservado.size).toBe(239)

      // Verificar que é o maior campo
      const allSizes = Object.values(TYPE8_PIX).map((field: any) => field.size || 0)
      const maxSize = Math.max(...allSizes)
      expect(TYPE8_PIX.reservado.size).toBe(maxSize)
    })

    test('campos de valor e percentual devem ter tamanhos corretos', () => {
      // Valores (máximo e mínimo) têm 13 caracteres
      expect(TYPE8_PIX.valor_maximo.size).toBe(13)
      expect(TYPE8_PIX.valor_minimo.size).toBe(13)

      // Percentuais (máximo e mínimo) têm 5 caracteres
      expect(TYPE8_PIX.percentual_maximo.size).toBe(5)
      expect(TYPE8_PIX.percentual_minimo.size).toBe(5)
    })

    test('código da chave DICT deve ter 77 caracteres', () => {
      expect(TYPE8_PIX.codigo_chave_dict.size).toBe(77)
    })

    test('identificador do QR Code deve ter 35 caracteres', () => {
      expect(TYPE8_PIX.identificador_qrcode.size).toBe(35)
    })
  })
})
