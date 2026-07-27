/**
 * Testes para Header de Lote - Sicredi CNAB 240
 */

import { SICREDI_CNAB240_BATCH_HEADER } from '../../../../../src/banks/sicredi/schemas/cnab240'

describe('Schema Sicredi CNAB 240 - Header de Lote', () => {
  describe('Definição dos campos - Manual versão 29', () => {
    it('deve ter código do banco na posição 1-3 com padrão "748"', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '748',
      })
    })

    it('deve ter número do lote na posição 4-7', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.controle_lote).toMatchObject({
        pos: [4, 7],
        type: 'num',
        size: 4,
      })
    })

    it('deve ter tipo de registro "1" (header de lote) na posição 8', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '1',
      })
    })

    it('deve ter tipo de operação "R" (remessa) na posição 9', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.servico_operacao).toMatchObject({
        pos: [9, 9],
        pattern: 'R',
      })
    })

    it('deve ter tipo de serviço "01" (cobrança) na posição 10-11', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.servico_tipo).toMatchObject({
        pos: [10, 11],
        pattern: '01',
      })
    })

    it('deve ter layout do lote "040" na posição 14-16', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.servico_layout).toMatchObject({
        pos: [14, 16],
        pattern: '040',
      })
    })

    it('deve ter tipo de inscrição do cedente na posição 18', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.cedente_inscricao_tipo).toMatchObject({
        pos: [18, 18],
        type: 'num',
        size: 1,
      })
    })

    it('deve ter CPF/CNPJ do cedente na posição 19-33 (15 dígitos)', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.cedente_inscricao_numero).toMatchObject({
        pos: [19, 33],
        type: 'num',
        size: 15,
      })
    })

    it('deve ter agência do cedente na posição 54-58', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.cedente_agencia).toMatchObject({
        pos: [54, 58],
        type: 'num',
        size: 5,
      })
    })

    it('deve ter conta do cedente na posição 60-71', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.cedente_conta).toMatchObject({
        pos: [60, 71],
        type: 'num',
        size: 12,
      })
    })

    it('deve ter DV da conta na posição 72', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.cedente_conta_dv).toMatchObject({
        pos: [72, 72],
        type: 'num',
        size: 1,
      })
    })

    it('deve ter nome do cedente na posição 74-103', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.cedente_nome).toMatchObject({
        pos: [74, 103],
        type: 'alfa',
        size: 30,
      })
    })

    it('deve ter sequencial da remessa na posição 184-191', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.remessa_sequencial).toMatchObject({
        pos: [184, 191],
        type: 'num',
        size: 8,
      })
    })

    it('deve ter data de geração na posição 192-199 com formato DDMMAAAA', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.data_geracao).toMatchObject({
        pos: [192, 199],
        dateFormat: 'DDMMAAAA',
      })
    })

    it('deve ter data de crédito na posição 200-207', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.data_credito).toMatchObject({
        pos: [200, 207],
        dateFormat: 'DDMMAAAA',
      })
    })
  })

  describe('Validação de estrutura', () => {
    it('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      Object.entries(SICREDI_CNAB240_BATCH_HEADER).forEach(
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
      Object.entries(SICREDI_CNAB240_BATCH_HEADER).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(fieldDef.size).toBe(tamanhoCalculado)
        },
      )
    })

    it('não deve haver sobreposição de posições', () => {
      const campos = Object.entries(SICREDI_CNAB240_BATCH_HEADER).map(
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

      Object.values(SICREDI_CNAB240_BATCH_HEADER).forEach((fieldDef: any) => {
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
    it('data de crédito deve ser opcional (usado só no retorno)', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.data_credito.required).toBe(false)
    })

    it('deve ter campo de mensagem 2 opcional', () => {
      const campo = SICREDI_CNAB240_BATCH_HEADER.mensagem_2
      expect(campo).toBeDefined()
      expect(campo.required).toBe(false)
    })

    it('layout do lote deve ser "040"', () => {
      expect(SICREDI_CNAB240_BATCH_HEADER.servico_layout.pattern).toBe('040')
    })
  })
})
