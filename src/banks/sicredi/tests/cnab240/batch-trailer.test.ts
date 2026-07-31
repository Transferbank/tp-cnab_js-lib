/**
 * Testes para Trailer de Lote - Sicredi CNAB 240
 */

import { SICREDI_CNAB240_BATCH_TRAILER } from '@banks/sicredi/schemas/cnab240'
import { FieldType } from '@tp-types/index'

describe('Schema Sicredi CNAB 240 - Trailer de Lote', () => {
  describe('Definio dos campos - Manual verso 29', () => {
    it('deve ter cdigo do banco na posio 1-3 com padro "748"', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '748',
      })
    })

    it('deve ter nmero do lote na posio 4-7', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.controle_lote).toMatchObject({
        pos: [4, 7],
        type: FieldType.NUM,
        size: 4,
      })
    })

    it('deve ter tipo de registro "5" (trailer de lote) na posio 8', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '5',
      })
    })

    it('deve ter quantidade de registros na posio 18-23', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.quantidade_registros).toMatchObject({
        pos: [18, 23],
        type: FieldType.NUM,
        size: 6,
      })
    })
  })

  describe('Campos de totalizao - usados s no retorno', () => {
    it('deve ter quantidade de ttulos cobrana simples na posio 24-29', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_simples).toMatchObject({
        pos: [24, 29],
        type: FieldType.NUM,
        size: 6,
      })
    })

    it('deve ter valor total ttulos cobrana simples na posio 30-46 (17 dgitos, 2 decimais)', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_valor_titulos_simples).toMatchObject({
        pos: [30, 46],
        type: FieldType.NUM,
        size: 17,
        decimals: 2,
      })
    })

    it('deve ter quantidade de ttulos vinculados na posio 47-52', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_vinculados).toMatchObject({
        pos: [47, 52],
        type: FieldType.NUM,
        size: 6,
      })
    })

    it('deve ter valor total ttulos vinculados na posio 53-69', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_valor_titulos_vinculados).toMatchObject({
        pos: [53, 69],
        type: FieldType.NUM,
        size: 17,
        decimals: 2,
      })
    })

    it('deve ter quantidade de ttulos caucionados na posio 70-75', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_caucionados).toMatchObject({
        pos: [70, 75],
        type: FieldType.NUM,
        size: 6,
      })
    })

    it('deve ter valor total ttulos caucionados na posio 76-92', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_valor_titulos_caucionados).toMatchObject({
        pos: [76, 92],
        type: FieldType.NUM,
        size: 17,
        decimals: 2,
      })
    })

    it('deve ter quantidade de ttulos descontados na posio 93-98', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_descontados).toMatchObject({
        pos: [93, 98],
        type: FieldType.NUM,
        size: 6,
      })
    })

    it('deve ter valor total ttulos descontados na posio 99-115', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_valor_titulos_descontados).toMatchObject({
        pos: [99, 115],
        type: FieldType.NUM,
        size: 17,
        decimals: 2,
      })
    })

    it('todos os campos de totalizao devem ser opcionais', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_simples.required).toBe(false)
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_valor_titulos_simples.required).toBe(false)
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_vinculados.required).toBe(false)
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_valor_titulos_vinculados.required).toBe(false)
    })
  })

  describe('Validao de estrutura', () => {
    it('todos os campos devem ter posio, tipo e tamanho definidos', () => {
      Object.entries(SICREDI_CNAB240_BATCH_TRAILER).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          expect(fieldDef.pos).toBeDefined()
          expect(fieldDef.type).toBeDefined()
          expect(fieldDef.size).toBeDefined()
          expect(fieldDef.pos.length).toBe(2)
          expect(fieldDef.pos[0]).toBeLessThanOrEqual(fieldDef.pos[1])
        },
      )
    })

    it('tamanhos declarados devem bater com as posies', () => {
      Object.entries(SICREDI_CNAB240_BATCH_TRAILER).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(fieldDef.size).toBe(tamanhoCalculado)
        },
      )
    })

    it('no deve haver sobreposio de posies', () => {
      const campos = Object.entries(SICREDI_CNAB240_BATCH_TRAILER).map(
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

    it('deve cobrir todas as 240 posies', () => {
      const posicoesCoberta = new Set<number>()

      Object.values(SICREDI_CNAB240_BATCH_TRAILER).forEach((fieldDef: any) => {
        for (let pos = fieldDef.pos[0]; pos <= fieldDef.pos[1]; pos++) {
          posicoesCoberta.add(pos)
        }
      })

      expect(posicoesCoberta.size).toBe(240)
      expect(Math.min(...posicoesCoberta)).toBe(1)
      expect(Math.max(...posicoesCoberta)).toBe(240)
    })
  })

  describe('Particularidades do Sicredi', () => {
    it('diferente do Santander, mantm estrutura rica de totalizadores mesmo em remessa', () => {
      // Verifica que os campos de totalizao existem
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_simples).toBeDefined()
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_valor_titulos_simples).toBeDefined()
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_vinculados).toBeDefined()
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_valor_titulos_vinculados).toBeDefined()
    })

    it('campos de totalizao devem mencionar que so usados s no retorno', () => {
      const descricaoSimples = SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_simples.description
      expect(descricaoSimples.toLowerCase()).toContain('retorno')
    })

    it('deve ter 4 tipos de cobrana totalizados (simples, vinculada, caucionada, descontada)', () => {
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_simples).toBeDefined()
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_vinculados).toBeDefined()
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_caucionados).toBeDefined()
      expect(SICREDI_CNAB240_BATCH_TRAILER.totais_quantidade_titulos_descontados).toBeDefined()
    })

    it('deve ter campo de nmero de aviso opcional', () => {
      const campo = SICREDI_CNAB240_BATCH_TRAILER.numero_aviso
      expect(campo).toBeDefined()
      expect(campo.required).toBe(false)
    })
  })
})

