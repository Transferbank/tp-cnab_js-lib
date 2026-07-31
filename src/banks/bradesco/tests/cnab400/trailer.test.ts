/**
 * Testes do Trailer - Bradesco CNAB 400
 * 
 * Valida a estrutura e campos do Trailer de Arquivo (tipo registro 9).
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Valores padrão
 * - Campos obrigatórios
 */

import { bradescoCnab400 } from '@banks/bradesco/schemas/cnab400'
import { extractLineFields } from '@parser/field-extractor'
import { readFixture } from './shared'

describe('Schema Bradesco CNAB 400 - Trailer', () => {
  describe('Definição dos campos', () => {
    test('deve ter tipo de registro "9" (trailer) na posição 1', () => {
      const field = bradescoCnab400.trailer!.tipo_registro
      
      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('9')
      expect(field.required).toBe(true)
    })

    test('deve ter brancos na posição 2-394', () => {
      const field = bradescoCnab400.trailer!.brancos
      
      expect(field.pos).toEqual([2, 394])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(393)
      expect(field.required).toBe(false)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = bradescoCnab400.trailer!.numero_sequencial
      
      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })
  })

  describe('Parsing de arquivo real', () => {
    let lines: string[]

    beforeAll(() => {
      lines = readFixture('remessa-multipla.txt')
    })

    test('deve extrair tipo de registro "9"', () => {
      const trailer = extractLineFields(lines[lines.length - 1], bradescoCnab400.trailer!)
      
      expect(trailer.tipo_registro.raw).toBe('9')
      expect(trailer.tipo_registro.value).toBe(9)
      expect(trailer.tipo_registro.error).toBeFalsy()
    })

    test('numero_sequencial deve ser exatamente igual ao total de linhas do arquivo (evidência estrutural)', () => {
      const trailer = extractLineFields(lines[lines.length - 1], bradescoCnab400.trailer!)
      
      // O trailer é sempre a última linha, e numero_sequencial deve conter
      // a posição 1-based dessa linha, ou seja, o total de linhas do arquivo.
      // Isso valida não só o parsing mas também a POSIÇÕO CORRETA do campo:
      // se estivesse em outra posição, não bateria com 76 (fixture real tem 76 linhas).
      expect(trailer.numero_sequencial.value).toBe(lines.length)
      expect(trailer.numero_sequencial.error).toBeFalsy()
    })
  })
})

