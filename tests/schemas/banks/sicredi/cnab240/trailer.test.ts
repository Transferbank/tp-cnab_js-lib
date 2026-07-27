/**
 * Testes para Trailer de Arquivo - Sicredi CNAB 240
 */

import { SICREDI_CNAB240_FILE_TRAILER } from '../../../../../src/banks/sicredi/schemas/cnab240'

describe('Schema Sicredi CNAB 240 - Trailer de Arquivo', () => {
  describe('Definição dos campos - Manual versão 29', () => {
    it('deve ter código do banco na posição 1-3 com padrão "748"', () => {
      expect(SICREDI_CNAB240_FILE_TRAILER.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '748',
      })
    })

    it('deve ter lote "9999" na posição 4-7', () => {
      expect(SICREDI_CNAB240_FILE_TRAILER.controle_lote).toMatchObject({
        pos: [4, 7],
        pattern: '9999',
      })
    })

    it('deve ter tipo de registro "9" (trailer) na posição 8', () => {
      expect(SICREDI_CNAB240_FILE_TRAILER.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '9',
      })
    })

    it('deve ter quantidade de lotes na posição 18-23', () => {
      expect(SICREDI_CNAB240_FILE_TRAILER.quantidade_lotes).toMatchObject({
        pos: [18, 23],
        type: 'num',
        size: 6,
      })
    })

    it('deve ter quantidade de registros na posição 24-29', () => {
      expect(SICREDI_CNAB240_FILE_TRAILER.quantidade_registros).toMatchObject({
        pos: [24, 29],
        type: 'num',
        size: 6,
      })
    })

    it('deve ter quantidade de contas na posição 30-35', () => {
      expect(SICREDI_CNAB240_FILE_TRAILER.quantidade_contas).toMatchObject({
        pos: [30, 35],
        type: 'num',
        size: 6,
      })
    })

    it('deve ter campo CNAB exclusivo cobrindo posições 36-240', () => {
      expect(SICREDI_CNAB240_FILE_TRAILER.cnab_exclusivo_2).toMatchObject({
        pos: [36, 240],
        type: 'alfa',
        size: 205,
      })
    })
  })

  describe('Validação de estrutura', () => {
    it('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      Object.entries(SICREDI_CNAB240_FILE_TRAILER).forEach(
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
      Object.entries(SICREDI_CNAB240_FILE_TRAILER).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(fieldDef.size).toBe(tamanhoCalculado)
        },
      )
    })

    it('não deve haver sobreposição de posições', () => {
      const campos = Object.entries(SICREDI_CNAB240_FILE_TRAILER).map(
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

      Object.values(SICREDI_CNAB240_FILE_TRAILER).forEach((fieldDef: any) => {
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
    it('quantidade de lotes sempre deve ser 000001 (Sicredi permite só 1 lote)', () => {
      const descricao = SICREDI_CNAB240_FILE_TRAILER.quantidade_lotes.description
      expect(descricao.toLowerCase()).toContain('000001')
      expect(descricao.toLowerCase()).toContain('1 lote')
    })

    it('quantidade de contas deve ser sempre 000000', () => {
      const campo = SICREDI_CNAB240_FILE_TRAILER.quantidade_contas
      expect(campo.description.toLowerCase()).toContain('000000')
    })

    it('quantidade de contas deve ser opcional', () => {
      expect(SICREDI_CNAB240_FILE_TRAILER.quantidade_contas.required).toBe(false)
    })
  })
})
