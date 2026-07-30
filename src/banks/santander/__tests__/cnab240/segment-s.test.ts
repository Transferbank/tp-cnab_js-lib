/**
 * Testes para Segmento S - Santander CNAB 240
 * 
 * Segmento opcional com duas variantes para mensagens de impress?o
 */

import { FieldType } from '@tp-types/index'
import {
  SANTANDER_CNAB240_SEGMENT_S,
  SANTANDER_CNAB240_SEGMENT_S_FORM,
  SANTANDER_CNAB240_SEGMENT_S_MESSAGES,
} from '@banks/santander/schemas/cnab240'

describe('Schema Santander CNAB 240 - Segmento S', () => {
  describe('Schema Base (posi??es 1-18)', () => {
    it('deve ter c?digo do banco na posi??o 1-3 com padr?o "033"', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '033',
      })
    })

    it('deve ter tipo de registro "3" (detalhe) na posi??o 8', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '3',
      })
    })

    it('deve ter identificador do segmento "S" na posi??o 14', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S.servico_segmento).toMatchObject({
        pos: [14, 14],
        pattern: 'S',
      })
    })

    it('deve ter identifica??o de impress?o na posi??o 18', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S.identificacao_impressao).toMatchObject({
        pos: [18, 18],
        type: FieldType.NUM,
      })
    })

    it('deve ter 8 campos no schema base', () => {
      const numCampos = Object.keys(SANTANDER_CNAB240_SEGMENT_S).length
      expect(numCampos).toBe(8)
    })
  })

  describe('Variante 1 - Formul?rio Especial', () => {
    it('deve incluir todos os campos da base', () => {
      const camposBase = Object.keys(SANTANDER_CNAB240_SEGMENT_S)
      camposBase.forEach((campo) => {
        expect(SANTANDER_CNAB240_SEGMENT_S_FORM[campo]).toBeDefined()
      })
    })

    it('deve ter n?mero da linha na posi??o 19-20', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S_FORM.numero_linha).toMatchObject({
        pos: [19, 20],
        type: FieldType.NUM,
        size: 2,
      })
    })

    it('deve ter mensagem para recibo na posi??o 21', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S_FORM.mensagem_recibo).toMatchObject({
        pos: [21, 21],
        type: FieldType.NUM,
        size: 1,
      })
    })

    it('deve ter mensagem impressa de 100 caracteres na posi??o 22-121', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S_FORM.mensagem_impressa).toMatchObject({
        pos: [22, 121],
        type: FieldType.ALFA,
        size: 100,
      })
    })

    it('deve ter campo CNAB reservado nas posi??es finais', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S_FORM.cnab_exclusivo_2).toMatchObject({
        pos: [122, 240],
        type: FieldType.ALFA,
        size: 119,
      })
    })
  })

  describe('Variante 2 - Mensagens Fixas', () => {
    it('deve incluir todos os campos da base', () => {
      const camposBase = Object.keys(SANTANDER_CNAB240_SEGMENT_S)
      camposBase.forEach((campo) => {
        expect(SANTANDER_CNAB240_SEGMENT_S_MESSAGES[campo]).toBeDefined()
      })
    })

    it('deve ter 5 mensagens de 40 caracteres cada', () => {
      for (let i = 5; i <= 9; i++) {
        const campo = SANTANDER_CNAB240_SEGMENT_S_MESSAGES[`mensagem_${i}`]
        expect(campo).toBeDefined()
        expect(campo.size).toBe(40)
        expect(campo.type).toBe('alfa')
      }
    })

    it('mensagem 5 deve come?ar na posi??o 19', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S_MESSAGES.mensagem_5.pos).toEqual([19, 58])
    })

    it('mensagem 9 deve terminar na posi??o 218', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S_MESSAGES.mensagem_9.pos).toEqual([179, 218])
    })

    it('mensagens devem ser sequenciais e cont?guas', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S_MESSAGES.mensagem_5.pos).toEqual([19, 58])
      expect(SANTANDER_CNAB240_SEGMENT_S_MESSAGES.mensagem_6.pos).toEqual([59, 98])
      expect(SANTANDER_CNAB240_SEGMENT_S_MESSAGES.mensagem_7.pos).toEqual([99, 138])
      expect(SANTANDER_CNAB240_SEGMENT_S_MESSAGES.mensagem_8.pos).toEqual([139, 178])
      expect(SANTANDER_CNAB240_SEGMENT_S_MESSAGES.mensagem_9.pos).toEqual([179, 218])
    })

    it('deve ter campo CNAB reservado cobrindo posi??es 219-240', () => {
      expect(SANTANDER_CNAB240_SEGMENT_S_MESSAGES.cnab_exclusivo_2).toMatchObject({
        pos: [219, 240],
        type: FieldType.ALFA,
        size: 22,
      })
    })
  })

  describe('Valida??o de estrutura - Variante Formul?rio', () => {
    it('todos os campos devem ter posi??o, tipo e tamanho definidos', () => {
      Object.entries(SANTANDER_CNAB240_SEGMENT_S_FORM).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          expect(fieldDef.pos).toBeDefined()
          expect(fieldDef.type).toBeDefined()
          expect(fieldDef.size).toBeDefined()
        },
      )
    })

    it('deve cobrir todas as 240 posi??es', () => {
      const posicoesCoberta = new Set<number>()

      Object.values(SANTANDER_CNAB240_SEGMENT_S_FORM).forEach(
        (fieldDef: any) => {
          for (let pos = fieldDef.pos[0]; pos <= fieldDef.pos[1]; pos++) {
            posicoesCoberta.add(pos)
          }
        },
      )

      expect(posicoesCoberta.size).toBe(240)
    })
  })

  describe('Valida??o de estrutura - Variante Mensagens', () => {
    it('todos os campos devem ter posi??o, tipo e tamanho definidos', () => {
      Object.entries(SANTANDER_CNAB240_SEGMENT_S_MESSAGES).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          expect(fieldDef.pos).toBeDefined()
          expect(fieldDef.type).toBeDefined()
          expect(fieldDef.size).toBeDefined()
        },
      )
    })

    it('deve cobrir todas as 240 posi??es', () => {
      const posicoesCoberta = new Set<number>()

      Object.values(SANTANDER_CNAB240_SEGMENT_S_MESSAGES).forEach((fieldDef: any) => {
        for (let pos = fieldDef.pos[0]; pos <= fieldDef.pos[1]; pos++) {
          posicoesCoberta.add(pos)
        }
      })

      expect(posicoesCoberta.size).toBe(240)
    })
  })
})

