/**
 * Testes para Header de Arquivo - Sicredi CNAB 240
 */

import { SICREDI_CNAB240_FILE_HEADER } from '@banks/sicredi/schemas/cnab240'
import { FieldType, DateFormat } from '@tp-types/index'

describe('Schema Sicredi CNAB 240 - Header de Arquivo', () => {
  describe('Definio dos campos - Manual verso 29', () => {
    it('deve ter cdigo do banco na posio 1-3 com padro "748"', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '748',
      })
    })

    it('deve ter lote "0000" na posio 4-7', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.controle_lote).toMatchObject({
        pos: [4, 7],
        pattern: '0000',
      })
    })

    it('deve ter tipo de registro "0" (header) na posio 8', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '0',
      })
    })

    it('deve ter tipo de inscrio do cedente na posio 18', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.cedente_inscricao_tipo).toMatchObject({
        pos: [18, 18],
        type: FieldType.NUM,
        size: 1,
      })
    })

    it('deve ter CPF/CNPJ do cedente na posio 19-32 (14 dgitos)', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.cedente_inscricao_numero).toMatchObject({
        pos: [19, 32],
        type: FieldType.NUM,
        size: 14,
      })
    })

    it('deve ter agncia do cedente na posio 53-57 (5 dgitos)', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.cedente_agencia).toMatchObject({
        pos: [53, 57],
        type: FieldType.NUM,
        size: 5,
      })
    })

    it('deve ter conta do cedente na posio 59-70 (12 dgitos)', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.cedente_conta).toMatchObject({
        pos: [59, 70],
        type: FieldType.NUM,
        size: 12,
      })
    })

    it('deve ter DV da conta na posio 71', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.cedente_conta_dv).toMatchObject({
        pos: [71, 71],
        type: FieldType.NUM,
        size: 1,
      })
    })

    it('deve ter nome do cedente na posio 73-102 (30 caracteres)', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.cedente_nome).toMatchObject({
        pos: [73, 102],
        type: FieldType.ALFA,
        size: 30,
      })
    })

    it('deve ter nome do banco na posio 103-132 com padro "SICREDI"', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.nome_do_banco).toMatchObject({
        pos: [103, 132],
        pattern: 'SICREDI',
      })
    })

    it('deve ter cdigo do arquivo "1" (remessa) na posio 143', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.arquivo_codigo).toMatchObject({
        pos: [143, 143],
        pattern: '1',
      })
    })

    it('deve ter data de gerao na posio 144-151 com formato DDMMAAAA', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.arquivo_data_de_geracao).toMatchObject({
        pos: [144, 151],
        dateFormat: DateFormat.DDMMAAAA,
      })
    })

    it('deve ter hora de gerao na posio 152-157 (HHMMSS)', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.arquivo_hora_de_geracao).toMatchObject({
        pos: [152, 157],
        type: FieldType.NUM,
        size: 6,
      })
    })

    it('deve ter sequencial do arquivo na posio 158-163', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.arquivo_sequencial).toMatchObject({
        pos: [158, 163],
        type: FieldType.NUM,
        size: 6,
      })
    })

    it('deve ter layout "081" na posio 164-166', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.arquivo_layout).toMatchObject({
        pos: [164, 166],
        pattern: '081',
      })
    })

    it('deve ter densidade "01600" na posio 167-171', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.densidade).toMatchObject({
        pos: [167, 171],
        pattern: '01600',
      })
    })
  })

  describe('Validao de estrutura', () => {
    it('todos os campos devem ter posio, tipo e tamanho definidos', () => {
      Object.entries(SICREDI_CNAB240_FILE_HEADER).forEach(
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
      Object.entries(SICREDI_CNAB240_FILE_HEADER).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(fieldDef.size).toBe(tamanhoCalculado)
        },
      )
    })

    it('no deve haver sobreposio de posies', () => {
      const campos = Object.entries(SICREDI_CNAB240_FILE_HEADER).map(
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

      Object.values(SICREDI_CNAB240_FILE_HEADER).forEach((fieldDef: any) => {
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
    it('deve ter verso de layout especfica do Sicredi (081)', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.arquivo_layout.pattern).toBe('081')
    })

    it('deve ter campo de hora de gerao (no presente em todos os bancos)', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.arquivo_hora_de_geracao).toBeDefined()
    })

    it('CPF/CNPJ deve ter 14 dgitos (no 15 como alguns bancos)', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.cedente_inscricao_numero.size).toBe(14)
    })

    it('conta deve ter 12 dgitos', () => {
      expect(SICREDI_CNAB240_FILE_HEADER.cedente_conta.size).toBe(12)
    })

    it('deve ter campo convnio mas no utilizado', () => {
      const campo = SICREDI_CNAB240_FILE_HEADER.convenio
      expect(campo).toBeDefined()
      expect(campo.required).toBe(false)
    })
  })
})

