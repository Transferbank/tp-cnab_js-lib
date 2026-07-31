/**
 * Testes para Segmento Q - Sicredi CNAB 240
 */

import { SICREDI_CNAB240_SEGMENT_Q } from '@banks/sicredi/schemas/cnab240'
import { FieldType } from '@tp-types/index'

describe('Schema Sicredi CNAB 240 - Segmento Q', () => {
  describe('Definio dos campos - Controle', () => {
    it('deve ter cdigo do banco na posio 1-3 com padro "748"', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.controle_banco).toMatchObject({
        pos: [1, 3],
        pattern: '748',
      })
    })

    it('deve ter tipo de registro "3" (detalhe) na posio 8', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.controle_registro).toMatchObject({
        pos: [8, 8],
        pattern: '3',
      })
    })

    it('deve ter identificador do segmento "Q" na posio 14', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.servico_segmento).toMatchObject({
        pos: [14, 14],
        pattern: 'Q',
      })
    })

    it('deve ter cdigo de movimento VARIVEL (no fixo) na posio 16-17', () => {
      const campo = SICREDI_CNAB240_SEGMENT_Q.servico_codigo_movimento
      expect(campo.pos).toEqual([16, 17])
      expect(campo.pattern).toBeNull()
      expect(campo.required).toBe(true)
    })
  })

  describe('Dados do pagador (sacado)', () => {
    it('deve ter tipo de inscrio na posio 18', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.sacado_inscricao_tipo).toMatchObject({
        pos: [18, 18],
        type: FieldType.NUM,
        size: 1,
      })
    })

    it('deve ter CPF/CNPJ do pagador na posio 19-33 (15 dgitos)', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.sacado_inscricao_numero).toMatchObject({
        pos: [19, 33],
        type: FieldType.NUM,
        size: 15,
      })
    })

    it('deve ter nome do pagador na posio 34-73 (40 caracteres)', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.sacado_nome).toMatchObject({
        pos: [34, 73],
        type: FieldType.ALFA,
        size: 40,
      })
    })

    it('descrio do nome deve mencionar que no deve ter acentuao', () => {
      const descricao = SICREDI_CNAB240_SEGMENT_Q.sacado_nome.description
      expect(descricao.toLowerCase()).toContain('sem acent')
    })

    it('deve ter endereo do pagador na posio 74-113 (40 caracteres)', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.sacado_endereco).toMatchObject({
        pos: [74, 113],
        type: FieldType.ALFA,
        size: 40,
      })
    })

    it('deve ter CEP na posio 129-136 (8 dgitos)', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.sacado_cep).toMatchObject({
        pos: [129, 136],
        type: FieldType.NUM,
        size: 8,
      })
    })

    it('deve ter cidade na posio 137-151 (15 caracteres)', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.sacado_cidade).toMatchObject({
        pos: [137, 151],
        type: FieldType.ALFA,
        size: 15,
      })
    })

    it('deve ter UF na posio 152-153 (2 caracteres)', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.sacado_uf).toMatchObject({
        pos: [152, 153],
        type: FieldType.ALFA,
        size: 2,
      })
    })
  })

  describe('Beneficirio Final (nomenclatura BACEN)', () => {
    it('deve ter tipo de pessoa do Beneficirio Final na posio 154', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.beneficiario_final_tipo).toMatchObject({
        pos: [154, 154],
        type: FieldType.NUM,
        size: 1,
      })
    })

    it('deve ter CPF/CNPJ do Beneficirio Final na posio 155-169', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.beneficiario_final_inscricao).toMatchObject({
        pos: [155, 169],
        type: FieldType.NUM,
        size: 15,
      })
    })

    it('deve ter nome do Beneficirio Final na posio 170-209 (40 caracteres)', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.beneficiario_final_nome).toMatchObject({
        pos: [170, 209],
        type: FieldType.ALFA,
        size: 40,
      })
    })

    it('nomenclatura deve ser "Beneficirio Final" (no Sacador/Avalista)', () => {
      const descricaoTipo = SICREDI_CNAB240_SEGMENT_Q.beneficiario_final_tipo.description
      const descricaoNome = SICREDI_CNAB240_SEGMENT_Q.beneficiario_final_nome.description

      expect(descricaoTipo).toContain('Beneficirio Final')
      expect(descricaoNome).toContain('Beneficirio Final')
    })

    it('descrio deve mencionar ausncia de Beneficirio Final (tipo 0)', () => {
      const descricao = SICREDI_CNAB240_SEGMENT_Q.beneficiario_final_tipo.description
      expect(descricao).toContain('0')
      expect(descricao.toLowerCase()).toContain('sem')
    })

    it('campos do Beneficirio Final devem ser opcionais', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.beneficiario_final_tipo.required).toBe(false)
      expect(SICREDI_CNAB240_SEGMENT_Q.beneficiario_final_inscricao.required).toBe(false)
      expect(SICREDI_CNAB240_SEGMENT_Q.beneficiario_final_nome.required).toBe(false)
    })
  })

  describe('Banco correspondente', () => {
    it('deve ter cdigo do banco correspondente na posio 210-212 (no utilizado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_Q.banco_correspondente_codigo
      expect(campo.pos).toEqual([210, 212])
      expect(campo.required).toBe(false)
      expect(campo.description).toContain('000')
    })

    it('deve ter nosso nmero no banco correspondente na posio 213-232 (no utilizado)', () => {
      const campo = SICREDI_CNAB240_SEGMENT_Q.banco_correspondente_nosso_numero
      expect(campo.pos).toEqual([213, 232])
      expect(campo.required).toBe(false)
    })
  })

  describe('Campo CNAB exclusivo', () => {
    it('deve ter campo CNAB exclusivo na posio 114-128', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.cnab_exclusivo_2).toMatchObject({
        pos: [114, 128],
        type: FieldType.ALFA,
        size: 15,
      })
    })

    it('deve ter campo CNAB exclusivo na posio 233-240', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.cnab_exclusivo_3).toMatchObject({
        pos: [233, 240],
        type: FieldType.ALFA,
        size: 8,
      })
    })
  })

  describe('Validao de estrutura', () => {
    it('todos os campos devem ter posio, tipo e tamanho definidos', () => {
      Object.entries(SICREDI_CNAB240_SEGMENT_Q).forEach(
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
      Object.entries(SICREDI_CNAB240_SEGMENT_Q).forEach(
        ([_fieldName, fieldDef]: [string, any]) => {
          const tamanhoCalculado = fieldDef.pos[1] - fieldDef.pos[0] + 1
          expect(fieldDef.size).toBe(tamanhoCalculado)
        },
      )
    })

    it('no deve haver sobreposio de posies', () => {
      const campos = Object.entries(SICREDI_CNAB240_SEGMENT_Q).map(
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

      Object.values(SICREDI_CNAB240_SEGMENT_Q).forEach((fieldDef: any) => {
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
    it('j usa nomenclatura atualizada "Beneficirio Final" conforme Circulares BACEN', () => {
      const comentario = SICREDI_CNAB240_SEGMENT_Q.beneficiario_final_tipo.description
      expect(comentario).toContain('Beneficirio Final')
    })

    it('campos do pagador devem ter nomes iniciados com "sacado_"', () => {
      expect(SICREDI_CNAB240_SEGMENT_Q.sacado_inscricao_tipo).toBeDefined()
      expect(SICREDI_CNAB240_SEGMENT_Q.sacado_inscricao_numero).toBeDefined()
      expect(SICREDI_CNAB240_SEGMENT_Q.sacado_nome).toBeDefined()
      expect(SICREDI_CNAB240_SEGMENT_Q.sacado_endereco).toBeDefined()
    })
  })
})

