/**
 * Testes do Segmento Q - Bradesco CNAB 240
 * 
 * Valida a estrutura e campos do Segmento Q (dados do pagador/sacado).
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Extração correta dos valores
 * - Tipos de dados corretos
 * 
 * NÃO testam regras de negócio (CPF/CNPJ válidos, etc.)
 */

import { bradescoCnab240 } from '@banks/bradesco/schemas/cnab240'
import { extractLineFields } from '@parser/field-extractor'
import { readFixture, findSegmentLines } from './shared'
import { loadCnab240Metadata, type FixtureRecord } from '../test-helpers'

describe('Schema Bradesco CNAB 240 - Segmento Q', () => {
  describe('Definição dos campos', () => {
    test('deve ter código do banco na posição 1-3 com padrão "237"', () => {
      const field = bradescoCnab240.segmentoQ!.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('237')
    })

    test('deve ter lote na posição 4-7', () => {
      const field = bradescoCnab240.segmentoQ!.controle_lote
      
      expect(field.pos).toEqual([4, 7])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      const field = bradescoCnab240.segmentoQ!.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('3')
    })

    test('deve ter número sequencial do registro na posição 9-13', () => {
      const field = bradescoCnab240.segmentoQ!.servico_numero_registro
      
      expect(field.pos).toEqual([9, 13])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter identificador do segmento "Q" na posição 14', () => {
      const field = bradescoCnab240.segmentoQ!.servico_segmento
      
      expect(field.pos).toEqual([14, 14])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('Q')
    })

    test('deve ter código de movimento na posição 16-17', () => {
      const field = bradescoCnab240.segmentoQ!.servico_codigo_movimento
      
      expect(field.pos).toEqual([16, 17])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter tipo de inscrição do sacado na posição 18', () => {
      const field = bradescoCnab240.segmentoQ!.sacado_inscricao_tipo
      
      expect(field.pos).toEqual([18, 18])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter número de inscrição (CPF/CNPJ) na posição 19-33', () => {
      const field = bradescoCnab240.segmentoQ!.sacado_inscricao_numero
      
      expect(field.pos).toEqual([19, 33])
      expect(field.type).toBe('num')
      expect(field.size).toBe(15)
      expect(field.required).toBe(true)
    })

    test('deve ter nome do sacado na posição 34-73', () => {
      const field = bradescoCnab240.segmentoQ!.sacado_nome
      
      expect(field.pos).toEqual([34, 73])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(true)
    })

    test('deve ter endereço do sacado na posição 74-113', () => {
      const field = bradescoCnab240.segmentoQ!.sacado_endereco
      
      expect(field.pos).toEqual([74, 113])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
      expect(field.required).toBe(false)
    })

    test('deve ter bairro do sacado na posição 114-128', () => {
      const field = bradescoCnab240.segmentoQ!.sacado_bairro
      
      expect(field.pos).toEqual([114, 128])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(15)
      expect(field.required).toBe(false)
    })

    test('deve ter campos de CEP (posição 129-136)', () => {
      expect(bradescoCnab240.segmentoQ!.sacado_cep.pos).toEqual([129, 133])
      expect(bradescoCnab240.segmentoQ!.sacado_cep_sufixo.pos).toEqual([134, 136])
    })

    test('deve ter cidade na posição 137-151', () => {
      const field = bradescoCnab240.segmentoQ!.sacado_cidade
      
      expect(field.pos).toEqual([137, 151])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(15)
    })

    test('deve ter UF na posição 152-153', () => {
      const field = bradescoCnab240.segmentoQ!.sacado_uf
      
      expect(field.pos).toEqual([152, 153])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(2)
    })

    test('deve ter campos do Beneficiário Final nas posições 154-209', () => {
      expect(bradescoCnab240.segmentoQ!.beneficiario_final_inscricao_tipo.pos).toEqual([154, 154])
      expect(bradescoCnab240.segmentoQ!.beneficiario_final_inscricao_numero.pos).toEqual([155, 169])
      expect(bradescoCnab240.segmentoQ!.beneficiario_final_nome.pos).toEqual([170, 209])
    })

    test('deve ter campos de banco correspondente nas posições 210-232', () => {
      expect(bradescoCnab240.segmentoQ!.banco_correspondente.pos).toEqual([210, 212])
      expect(bradescoCnab240.segmentoQ!.numero_banco_correspondente.pos).toEqual([213, 232])
    })

    test('deve ter campo CNAB exclusivo na posição 233-240', () => {
      const field = bradescoCnab240.segmentoQ!.cnab_exclusivo_2
      
      expect(field.pos).toEqual([233, 240])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(8)
    })

    test('deve ter 22 campos definidos no total', () => {
      const campos = Object.keys(bradescoCnab240.segmentoQ!)
      expect(campos.length).toBe(22)
    })
  })

  describe('Parsing de arquivo real', () => {
    let lines: string[]
    let segQLines: string[]

    beforeAll(() => {
      lines = readFixture('remessa-multipla.txt')
      // Segmentos Q são localizados pelo conteúdo (pos 8 = '3', pos 14 = 'Q'), não por
      // éndice fixo, já que o arquivo também tem Header de Lote e Segmentos P/R/S entre eles.
      segQLines = findSegmentLines(lines, 'Q')
    })

    test('deve extrair tipo de documento do primeiro pagador (do JSON)', () => {
      const metadata = loadCnab240Metadata()
      const record = metadata.records[0]
      const segQ = extractLineFields(segQLines[0], bradescoCnab240.segmentoQ!)

      expect(segQ.sacado_inscricao_tipo.raw).toBe(record.documentTypeCode)
      expect(segQ.sacado_inscricao_numero.error).toBeFalsy()
    })

    test('deve extrair documento do primeiro pagador (do JSON)', () => {
      const metadata = loadCnab240Metadata()
      const record = metadata.records[0]
      const segQ = extractLineFields(segQLines[0], bradescoCnab240.segmentoQ!)

      if (record.documentRaw) {
        expect(segQ.sacado_inscricao_numero.raw).toBe(record.documentRaw)
      }
      expect(segQ.sacado_inscricao_numero.error).toBeFalsy()
    })

    test('deve extrair nome do primeiro pagador (do JSON)', () => {
      const metadata = loadCnab240Metadata()
      const record = metadata.records[0]
      const segQ = extractLineFields(segQLines[0], bradescoCnab240.segmentoQ!)

      if (record.name) {
        expect(segQ.sacado_nome.value).toMatch(new RegExp(record.name))
      }
      expect(segQ.sacado_nome.error).toBeFalsy()
    })

    test('deve extrair endereço completo do primeiro pagador (do JSON)', () => {
      const metadata = loadCnab240Metadata()
      const record = metadata.records[0]
      const segQ = extractLineFields(segQLines[0], bradescoCnab240.segmentoQ!)

      if (record.address) {
        expect(segQ.sacado_endereco.value).toMatch(new RegExp(record.address))
      }
      expect(segQ.sacado_cidade.value).toBeDefined()
      expect(segQ.sacado_uf.value).toBeDefined()
      expect(segQ.sacado_endereco.error).toBeFalsy()
    })

    test('deve extrair nomes de todos os pagadores (do JSON)', () => {
      const metadata = loadCnab240Metadata()

      metadata.records.forEach((expected: FixtureRecord, index: number) => {
        const segQ = extractLineFields(segQLines[index], bradescoCnab240.segmentoQ!)

        expect(segQ.sacado_nome.value).toMatch(new RegExp(expected.name))
        expect(segQ.sacado_nome.error).toBeFalsy()
      })
    })

    test('deve extrair documentos completos de todos os pagadores (do JSON)', () => {
      const metadata = loadCnab240Metadata()

      metadata.records.forEach((expected: FixtureRecord, index: number) => {
        const segQ = extractLineFields(segQLines[index], bradescoCnab240.segmentoQ!)

        expect(segQ.sacado_inscricao_numero.raw).toBe(expected.documentRaw)
        expect(segQ.sacado_inscricao_numero.error).toBeFalsy()
      })
    })

    test('deve extrair tipo de documento de todos os pagadores (do JSON)', () => {
      const metadata = loadCnab240Metadata()

      metadata.records.forEach((record: FixtureRecord, index: number) => {
        const segQ = extractLineFields(segQLines[index], bradescoCnab240.segmentoQ!)

        expect(segQ.sacado_inscricao_tipo.raw).toBe(record.documentTypeCode)
        expect(segQ.sacado_inscricao_tipo.error).toBeFalsy()
      })
    })

    test('deve extrair documentos raw de todos os pagadores (do JSON)', () => {
      const metadata = loadCnab240Metadata()

      metadata.records.forEach((record: FixtureRecord, index: number) => {
        if (record.documentRaw) {
          const segQ = extractLineFields(segQLines[index], bradescoCnab240.segmentoQ!)

          expect(segQ.sacado_inscricao_numero.raw).toBe(record.documentRaw)
          expect(segQ.sacado_inscricao_numero.error).toBeFalsy()
        }
      })
    })

    test('deve incluir endereços em todos os registros parseados', () => {
      const metadata = loadCnab240Metadata()

      metadata.records.forEach((expected: FixtureRecord, index: number) => {
        if (expected.address) {
          const segQ = extractLineFields(segQLines[index], bradescoCnab240.segmentoQ!)

          expect(segQ.sacado_endereco.value).toMatch(new RegExp(expected.address))
          expect(segQ.sacado_endereco.error).toBeFalsy()
        }
      })
    })
  })
})

