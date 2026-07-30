/**
 * Testes para Trailer de Arquivo - Santander CNAB 240
 */

import { SANTANDER_CNAB240_FILE_TRAILER } from '@banks/santander/schemas/cnab240'
import { FieldType } from '@tp-types/index'

describe('Schema Santander CNAB 240 - Trailer de Arquivo', () => {
  describe('Defini??o dos campos - Manual 2023', () => {
    it('deve ter c?digo do banco na posi??o 1-3 com padr?o "033"', () => {
      expect(SANTANDER_CNAB240_FILE_TRAILER.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '033',
      })
    })

    it('deve ter lote "9999" na posi??o 4-7', () => {
      expect(SANTANDER_CNAB240_FILE_TRAILER.controle_lote).toMatchObject({
        pos: [4, 7],
        pattern: '9999',
      })
    })

    it('deve ter tipo de registro "9" (trailer) na posi??o 8', () => {
      expect(SANTANDER_CNAB240_FILE_TRAILER.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '9',
      })
    })

    it('deve ter quantidade de lotes na posi??o 18-23', () => {
      expect(SANTANDER_CNAB240_FILE_TRAILER.totais_quantidade_lotes).toMatchObject({
        pos: [18, 23],
        type: FieldType.NUM,
        size: 6,
      })
    })

    it('deve ter quantidade de registros na posi??o 24-29', () => {
      expect(SANTANDER_CNAB240_FILE_TRAILER.totais_quantidade_registros).toMatchObject({
        pos: [24, 29],
        type: FieldType.NUM,
        size: 6,
      })
    })

    it('deve ter campo CNAB exclusivo nas posi??es restantes', () => {
      // Campo reservado ou CNAB exclusivo cobrindo o resto
      const campos = Object.values(SANTANDER_CNAB240_FILE_TRAILER)
      const temCampoReservado = campos.some(
        (campo: any) =>
          campo.pos &&
          campo.pos[0] >= 30 &&
          campo.pos[1] === 240 &&
          (campo.description?.includes('Reservado') ||
            campo.description?.includes('CNAB') ||
            campo.description?.includes('exclusivo')),
      )
      expect(temCampoReservado).toBe(true)
    })
  })

  describe('Valida??o de estrutura', () => {
    it('todos os campos devem ter posi??o, tipo e tamanho definidos', () => {
      Object.entries(SANTANDER_CNAB240_FILE_TRAILER).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          expect(fieldDef.pos).toBeDefined()
          expect(fieldDef.type).toBeDefined()
          expect(fieldDef.size).toBeDefined()
          expect(fieldDef.pos.length).toBe(2)
          expect(fieldDef.pos[0]).toBeLessThanOrEqual(fieldDef.pos[1])
        },
      )
    })

    it('tamanhos declarados devem bater com as posi??es', () => {
      Object.entries(SANTANDER_CNAB240_FILE_TRAILER).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(fieldDef.size).toBe(tamanhoCalculado)
        },
      )
    })

    it('n?o deve haver sobreposi??o de posi??es', () => {
      const campos = Object.entries(SANTANDER_CNAB240_FILE_TRAILER).map(
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

    it('deve cobrir todas as 240 posi??es', () => {
      const posicoesCoberta = new Set<number>()

      Object.values(SANTANDER_CNAB240_FILE_TRAILER).forEach((fieldDef: any) => {
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

