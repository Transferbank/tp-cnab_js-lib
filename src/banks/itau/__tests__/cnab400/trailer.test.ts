/**
 * Testes do Schema Itaú CNAB 400 - Trailer
 *
 * Parte 1: Definição dos campos (sem fixture)
 * Parte 2: Parsing de arquivo real
 */

import { itauCnab400 } from '@banks/itau/schemas/cnab400'
import { extractLineFields } from '@parser/field-extractor'
import { readFixture } from './shared'

describe('Schema Itaú CNAB 400 - Trailer', () => {
  describe('Definição dos campos', () => {
    const trailer = itauCnab400.trailer!

    test('deve ter tipo de registro "9" (trailer) na posição 1', () => {
      expect(trailer.tipo_registro).toBeDefined()
      expect(trailer.tipo_registro.pos).toEqual([1, 1])
      expect(trailer.tipo_registro.type).toBe('num')
      expect(trailer.tipo_registro.size).toBe(1)
      expect(trailer.tipo_registro.pattern).toBe('9')
    })

    test('deve ter brancos na posição 2-394', () => {
      expect(trailer.brancos).toBeDefined()
      expect(trailer.brancos.pos).toEqual([2, 394])
      expect(trailer.brancos.type).toBe('alfa')
      expect(trailer.brancos.size).toBe(393)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(trailer.numero_sequencial).toBeDefined()
      expect(trailer.numero_sequencial.pos).toEqual([395, 400])
      expect(trailer.numero_sequencial.type).toBe('num')
      expect(trailer.numero_sequencial.size).toBe(6)
      expect(trailer.numero_sequencial.required).toBe(true)
    })
  })

  describe('Parsing de arquivo real', () => {
    const lines = readFixture('ITAU_cnab_400.REM')
    const trailerLine = lines[lines.length - 1]

    test('deve extrair tipo de registro "9" (trailer)', () => {
      const trailer = extractLineFields(trailerLine, itauCnab400.trailer!)
      expect(trailer.tipo_registro.raw).toBe('9')
    })

    test('numero_sequencial deve ser exatamente igual ao total de linhas do arquivo (evidência estrutural)', () => {
      const trailer = extractLineFields(trailerLine, itauCnab400.trailer!)
      
      // Trailer é sempre a última linha, numero_sequencial deve ser igual ao total de linhas
      expect(trailer.numero_sequencial.value).toBe(lines.length)
      expect(trailer.numero_sequencial.value).toBe(640)
    })

    test('brancos deve conter apenas espaços (evidência estrutural)', () => {
      const trailer = extractLineFields(trailerLine, itauCnab400.trailer!)
      const brancosValue = String(trailer.brancos.raw || '')
      
      // Todos os caracteres devem ser espaços
      expect(brancosValue.trim()).toBe('')
      expect(brancosValue.length).toBe(393)
    })
  })
})

