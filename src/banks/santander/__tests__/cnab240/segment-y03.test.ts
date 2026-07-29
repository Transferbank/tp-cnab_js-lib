/**
 * Testes para Segmento Y-03 - Santander CNAB 240
 * 
 * Segmento opcional para dados PIX (chave PIX e QR Code)
 */

import { SANTANDER_CNAB240_SEGMENT_Y03 } from '@banks/santander/schemas/cnab240'

describe('Schema Santander CNAB 240 - Segmento Y-03 (PIX)', () => {
  describe('Definição dos campos', () => {
    it('deve ter código do banco na posição 1-3 com padrão "033"', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y03.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '033',
      })
    })

    it('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y03.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '3',
      })
    })

    it('deve ter identificador do segmento "Y" na posição 14', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y03.servico_segmento).toMatchObject({
        pos: [14, 14],
        pattern: 'Y',
      })
    })

    it('deve ter código de registro opcional "03" na posição 18-19', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y03.registro_opcional_id).toMatchObject({
        pos: [18, 19],
        pattern: '03',
      })
    })

    it('deve ter campo para tipo de chave PIX', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y03.pix_tipo_chave).toBeDefined()
      expect(SANTANDER_CNAB240_SEGMENT_Y03.pix_tipo_chave.type).toBe('alfa')
    })

    it('deve ter campo para chave PIX', () => {
      const campo = SANTANDER_CNAB240_SEGMENT_Y03.pix_chave
      expect(campo).toBeDefined()
      expect(campo.type).toBe('alfa')
      expect(campo.size).toBeGreaterThan(0)
    })

    it('deve ter campo para TXID do PIX (código de identificação do QR Code)', () => {
      const campo = SANTANDER_CNAB240_SEGMENT_Y03.pix_qrcode_txid
      expect(campo).toBeDefined()
      expect(campo.type).toBe('alfa')
    })
  })

  describe('Validação de estrutura', () => {
    it('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      Object.entries(SANTANDER_CNAB240_SEGMENT_Y03).forEach(
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
      Object.entries(SANTANDER_CNAB240_SEGMENT_Y03).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(fieldDef.size).toBe(tamanhoCalculado)
        },
      )
    })

    it('não deve haver sobreposição de posições', () => {
      const campos = Object.entries(SANTANDER_CNAB240_SEGMENT_Y03).map(
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

      Object.values(SANTANDER_CNAB240_SEGMENT_Y03).forEach((fieldDef: any) => {
        for (let pos = fieldDef.pos[0]; pos <= fieldDef.pos[1]; pos++) {
          posicoesCoberta.add(pos)
        }
      })

      expect(posicoesCoberta.size).toBe(240)
      expect(Math.min(...posicoesCoberta)).toBe(1)
      expect(Math.max(...posicoesCoberta)).toBe(240)
    })
  })

  describe('Campos específicos PIX', () => {
    it('tipo de chave PIX deve ser alfanumérico', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y03.pix_tipo_chave.type).toBe('alfa')
    })

    it('campos PIX devem ser opcionais', () => {
      expect(SANTANDER_CNAB240_SEGMENT_Y03.pix_chave.required).toBe(false)
      expect(SANTANDER_CNAB240_SEGMENT_Y03.pix_qrcode_txid.required).toBe(false)
    })
  })
})
