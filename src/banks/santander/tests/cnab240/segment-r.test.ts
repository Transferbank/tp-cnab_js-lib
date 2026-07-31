/**
 * Testes para Segmento R - Santander CNAB 240
 * 
 * Segmento opcional: descontos adicionais, multa e mensagens
 */

import { SANTANDER_CNAB240_SEGMENT_R } from '@banks/santander/schemas/cnab240'

describe('Schema Santander CNAB 240 - Segmento R', () => {
  describe('Definição dos campos - Controle', () => {
    it('deve ter código do banco na posição 1-3 com padrão "033"', () => {
      expect(SANTANDER_CNAB240_SEGMENT_R.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '033',
      })
    })

    it('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      expect(SANTANDER_CNAB240_SEGMENT_R.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '3',
      })
    })

    it('deve ter identificador do segmento "R" na posição 14', () => {
      expect(SANTANDER_CNAB240_SEGMENT_R.servico_segmento).toMatchObject({
        pos: [14, 14],
        pattern: 'R',
      })
    })

    it('deve ter código de movimento VARIÁVEL (não fixo) na posição 16-17', () => {
      const campo = SANTANDER_CNAB240_SEGMENT_R.servico_codigo_movimento
      expect(campo.pos).toEqual([16, 17])
      expect(campo.pattern).toBeNull() // variável, não fixo
    })
  })

  describe('Campos de desconto e multa', () => {
    it('deve ter campos do segundo desconto (código, data, valor)', () => {
      expect(SANTANDER_CNAB240_SEGMENT_R.desconto2_codigo).toBeDefined()
      expect(SANTANDER_CNAB240_SEGMENT_R.desconto2_data).toBeDefined()
      expect(SANTANDER_CNAB240_SEGMENT_R.desconto2_valor).toBeDefined()
    })

    it('deve ter campos do terceiro desconto (código, data, valor)', () => {
      expect(SANTANDER_CNAB240_SEGMENT_R.desconto3_codigo).toBeDefined()
      expect(SANTANDER_CNAB240_SEGMENT_R.desconto3_data).toBeDefined()
      expect(SANTANDER_CNAB240_SEGMENT_R.desconto3_valor).toBeDefined()
    })

    it('deve ter campos de multa (código, data, valor/percentual)', () => {
      expect(SANTANDER_CNAB240_SEGMENT_R.multa_codigo).toBeDefined()
      expect(SANTANDER_CNAB240_SEGMENT_R.multa_data).toBeDefined()
      expect(SANTANDER_CNAB240_SEGMENT_R.multa_valor).toBeDefined()
    })

    it('campos de valor de desconto devem ter 2 decimais', () => {
      expect(SANTANDER_CNAB240_SEGMENT_R.desconto2_valor.decimals).toBe(2)
      expect(SANTANDER_CNAB240_SEGMENT_R.desconto3_valor.decimals).toBe(2)
    })

    it('campo de multa deve ter 2 decimais', () => {
      expect(SANTANDER_CNAB240_SEGMENT_R.multa_valor.decimals).toBe(2)
    })
  })

  describe('Validação de estrutura', () => {
    it('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      Object.entries(SANTANDER_CNAB240_SEGMENT_R).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          expect(fieldDef.pos).toBeDefined()
          expect(fieldDef.type).toBeDefined()
          expect(fieldDef.size).toBeDefined()
          expect(fieldDef.pos.length).toBe(2)
          expect(fieldDef.pos[0]).toBeLessThanOrEqual(fieldDef.pos[1])
        },
      )
    })

    it('tamanhos declarados devem bater com as posições', () => {
      Object.entries(SANTANDER_CNAB240_SEGMENT_R).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(fieldDef.size).toBe(tamanhoCalculado)
        },
      )
    })

    it('não deve haver sobreposição de posições', () => {
      const campos = Object.entries(SANTANDER_CNAB240_SEGMENT_R).map(
        ([name, def]: [string, any]) => ({
          name,
          start: def.pos[0],
          end: def.pos[1],
        }),
      )

      campos.sort((a, b) => a.start - b.start)

      for (let i = 0; i < campos.length - 1; i++) {
        const atual = campos[i]
        const proximo = campos[i + 1]
        expect(atual.end).toBeLessThan(proximo.start)
      }
    })

    it('deve cobrir todas as 240 posições', () => {
      const posicoesCoberta = new Set<number>()

      Object.values(SANTANDER_CNAB240_SEGMENT_R).forEach((fieldDef: any) => {
        for (let pos = fieldDef.pos[0]; pos <= fieldDef.pos[1]; pos++) {
          posicoesCoberta.add(pos)
        }
      })

      expect(posicoesCoberta.size).toBe(240)
      expect(Math.min(...posicoesCoberta)).toBe(1)
      expect(Math.max(...posicoesCoberta)).toBe(240)
    })
  })
})

