/**
 * Testes do Schema Sicredi CNAB 400 - Registro Tipo 7 (Descontos 2 e 3)
 *
 * Registro opcional para cadastrar 2º e 3º nível de desconto (além do desconto 1 do detalhe).
 * Mutuamente excludente com desconto por dia de antecipação.
 *
 * Fonte: Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.6, p.34
 */

import { TYPE7_DISCOUNTS } from '../../../../../../src/banks/sicredi/schemas/cnab400/registros-opcionais/type7-discounts/type7-discounts'

describe('Schema Sicredi CNAB 400 - Registro Tipo 7 (Descontos 2 e 3)', () => {
  describe('Campos de controle', () => {
    test('deve ter tipo de registro "7" na posição 1', () => {
      expect(TYPE7_DISCOUNTS.tipo_registro).toBeDefined()
      expect(TYPE7_DISCOUNTS.tipo_registro.pos).toEqual([1, 1])
      expect(TYPE7_DISCOUNTS.tipo_registro.type).toBe('num')
      expect(TYPE7_DISCOUNTS.tipo_registro.size).toBe(1)
      expect(TYPE7_DISCOUNTS.tipo_registro.pattern).toBe('7')
      expect(TYPE7_DISCOUNTS.tipo_registro.required).toBe(true)
    })

    test('deve ter nosso número na posição 2-16', () => {
      expect(TYPE7_DISCOUNTS.nosso_numero).toBeDefined()
      expect(TYPE7_DISCOUNTS.nosso_numero.pos).toEqual([2, 16])
      expect(TYPE7_DISCOUNTS.nosso_numero.type).toBe('alfa')
      expect(TYPE7_DISCOUNTS.nosso_numero.size).toBe(15)
    })

    test('deve ter número do documento na posição 17-26', () => {
      expect(TYPE7_DISCOUNTS.numero_documento).toBeDefined()
      expect(TYPE7_DISCOUNTS.numero_documento.pos).toEqual([17, 26])
      expect(TYPE7_DISCOUNTS.numero_documento.type).toBe('alfa')
      expect(TYPE7_DISCOUNTS.numero_documento.size).toBe(10)
    })

    test('deve ter número de inscrição do pagador na posição 27-40', () => {
      expect(TYPE7_DISCOUNTS.numero_inscricao_pagador).toBeDefined()
      expect(TYPE7_DISCOUNTS.numero_inscricao_pagador.pos).toEqual([27, 40])
      expect(TYPE7_DISCOUNTS.numero_inscricao_pagador.type).toBe('num')
      expect(TYPE7_DISCOUNTS.numero_inscricao_pagador.size).toBe(14)
      expect(TYPE7_DISCOUNTS.numero_inscricao_pagador.required).toBe(true)
    })

    test('deve ter número de inscrição do beneficiário final na posição 41-54', () => {
      expect(TYPE7_DISCOUNTS.numero_inscricao_beneficiario_final).toBeDefined()
      expect(TYPE7_DISCOUNTS.numero_inscricao_beneficiario_final.pos).toEqual([41, 54])
      expect(TYPE7_DISCOUNTS.numero_inscricao_beneficiario_final.type).toBe('num')
      expect(TYPE7_DISCOUNTS.numero_inscricao_beneficiario_final.size).toBe(14)
    })
  })

  describe('Campos do 2º desconto', () => {
    test('deve ter data limite do 2º desconto na posição 55-60 com formato DDMMAA', () => {
      expect(TYPE7_DISCOUNTS.data_limite_desconto_2).toBeDefined()
      expect(TYPE7_DISCOUNTS.data_limite_desconto_2.pos).toEqual([55, 60])
      expect(TYPE7_DISCOUNTS.data_limite_desconto_2.type).toBe('data')
      expect(TYPE7_DISCOUNTS.data_limite_desconto_2.size).toBe(6)
      expect(TYPE7_DISCOUNTS.data_limite_desconto_2.dateFormat).toBe('DDMMAA')
      expect(TYPE7_DISCOUNTS.data_limite_desconto_2.required).toBe(true)
    })

    test('deve ter valor do 2º desconto na posição 61-73 com 2 decimais', () => {
      expect(TYPE7_DISCOUNTS.valor_desconto_2).toBeDefined()
      expect(TYPE7_DISCOUNTS.valor_desconto_2.pos).toEqual([61, 73])
      expect(TYPE7_DISCOUNTS.valor_desconto_2.type).toBe('num')
      expect(TYPE7_DISCOUNTS.valor_desconto_2.size).toBe(13)
      expect(TYPE7_DISCOUNTS.valor_desconto_2.decimals).toBe(2)
      expect(TYPE7_DISCOUNTS.valor_desconto_2.required).toBe(true)
    })
  })

  describe('Campos do 3º desconto', () => {
    test('deve ter data limite do 3º desconto na posição 74-79 com formato DDMMAA', () => {
      expect(TYPE7_DISCOUNTS.data_limite_desconto_3).toBeDefined()
      expect(TYPE7_DISCOUNTS.data_limite_desconto_3.pos).toEqual([74, 79])
      expect(TYPE7_DISCOUNTS.data_limite_desconto_3.type).toBe('data')
      expect(TYPE7_DISCOUNTS.data_limite_desconto_3.size).toBe(6)
      expect(TYPE7_DISCOUNTS.data_limite_desconto_3.dateFormat).toBe('DDMMAA')
    })

    test('deve ter valor do 3º desconto na posição 80-92 com 2 decimais', () => {
      expect(TYPE7_DISCOUNTS.valor_desconto_3).toBeDefined()
      expect(TYPE7_DISCOUNTS.valor_desconto_3.pos).toEqual([80, 92])
      expect(TYPE7_DISCOUNTS.valor_desconto_3.type).toBe('num')
      expect(TYPE7_DISCOUNTS.valor_desconto_3.size).toBe(13)
      expect(TYPE7_DISCOUNTS.valor_desconto_3.decimals).toBe(2)
    })
  })

  describe('Campos finais', () => {
    test('deve ter brancos na posição 93-394', () => {
      expect(TYPE7_DISCOUNTS.brancos).toBeDefined()
      expect(TYPE7_DISCOUNTS.brancos.pos).toEqual([93, 394])
      expect(TYPE7_DISCOUNTS.brancos.type).toBe('alfa')
      expect(TYPE7_DISCOUNTS.brancos.size).toBe(302)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(TYPE7_DISCOUNTS.numero_sequencial).toBeDefined()
      expect(TYPE7_DISCOUNTS.numero_sequencial.pos).toEqual([395, 400])
      expect(TYPE7_DISCOUNTS.numero_sequencial.type).toBe('num')
      expect(TYPE7_DISCOUNTS.numero_sequencial.size).toBe(6)
      expect(TYPE7_DISCOUNTS.numero_sequencial.required).toBe(true)
    })
  })

  describe('Integridade do schema', () => {
    test('não deve ter sobreposição de posições', () => {
      const campos = Object.keys(TYPE7_DISCOUNTS)
      const posicoes: { campo: string; inicio: number; fim: number }[] = []

      campos.forEach((campo) => {
        const fieldDef = TYPE7_DISCOUNTS[campo]
        if (fieldDef.pos) {
          posicoes.push({
            campo,
            inicio: fieldDef.pos[0],
            fim: fieldDef.pos[1],
          })
        }
      })

      posicoes.sort((a, b) => a.inicio - b.inicio)

      for (let i = 0; i < posicoes.length - 1; i++) {
        const atual = posicoes[i]
        const proximo = posicoes[i + 1]
        expect(atual.fim).toBeLessThan(proximo.inicio)
      }
    })

    test('tamanho declarado deve bater com posições', () => {
      const campos = Object.keys(TYPE7_DISCOUNTS)
      campos.forEach((campo) => {
        const fieldDef = TYPE7_DISCOUNTS[campo]
        if (fieldDef.pos && fieldDef.size !== undefined) {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(tamanhoCalculado).toBe(fieldDef.size)
        }
      })
    })

    test('deve ter exatamente 400 posições', () => {
      const ultimoCampo = TYPE7_DISCOUNTS.numero_sequencial
      expect(ultimoCampo.pos[1]).toBe(400)
    })
  })

  describe('Características específicas', () => {
    test('tipo_registro deve ter padrão fixo "7"', () => {
      expect(TYPE7_DISCOUNTS.tipo_registro.pattern).toBe('7')
    })

    test('campo brancos deve ser o maior campo do layout', () => {
      const campos = Object.values(TYPE7_DISCOUNTS)
      const tamanhos = campos.map((campo: any) => campo.size || 0)
      const maiorTamanho = Math.max(...tamanhos)

      expect(TYPE7_DISCOUNTS.brancos.size).toBe(maiorTamanho)
      expect(TYPE7_DISCOUNTS.brancos.size).toBe(302)
    })

    test('deve ter campos obrigatórios e opcionais corretos', () => {
      // 2º desconto é obrigatório
      expect(TYPE7_DISCOUNTS.data_limite_desconto_2.required).toBe(true)
      expect(TYPE7_DISCOUNTS.valor_desconto_2.required).toBe(true)

      // 3º desconto é opcional
      expect(TYPE7_DISCOUNTS.data_limite_desconto_3.required).toBeFalsy()
      expect(TYPE7_DISCOUNTS.valor_desconto_3.required).toBeFalsy()
    })

    test('deve usar formato DDMMAA para datas', () => {
      expect(TYPE7_DISCOUNTS.data_limite_desconto_2.dateFormat).toBe('DDMMAA')
      expect(TYPE7_DISCOUNTS.data_limite_desconto_3.dateFormat).toBe('DDMMAA')
    })
  })
})
