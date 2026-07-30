/**
 * Testes do Schema Banco do Brasil CNAB 400 - Trailer
 *
 * Parte 1: Definição dos campos (sem fixture)
 * Parte 2: Parsing de arquivo real
 */

import { bancoDoBrasilCnab400 } from '@banks/bancoDoBrasil/schemas/cnab400'
import { extractLineFields } from '@parser/field-extractor'
import * as fs from 'fs'
import * as path from 'path'

function readFixture(filename: string): string[] {
  const fixturePath = path.join(__dirname, '../__fixtures__', filename)
  const content = fs.readFileSync(fixturePath, 'latin1')
  return content.split(/\r?\n/).filter((line) => line.trim().length > 0)
}

describe('Schema Banco do Brasil CNAB 400 - Trailer', () => {
  describe('Parsing de arquivo real', () => {
    const lines = readFixture('BANCOBRASIL_cnab_400.REM')
    const trailerLine = lines[lines.length - 1]

    test('deve extrair tipo de registro "9" (trailer)', () => {
      const trailer = extractLineFields(trailerLine, bancoDoBrasilCnab400.trailer!)
      expect(trailer.tipo_registro.raw).toBe('9')
    })

    test('numero_sequencial deve ser exatamente igual ao total de linhas do arquivo (evidência estrutural)', () => {
      const trailer = extractLineFields(trailerLine, bancoDoBrasilCnab400.trailer!)

      // Trailer é sempre a última linha, numero_sequencial deve ser igual ao total de linhas
      expect(trailer.numero_sequencial.value).toBe(lines.length)
      expect(trailer.numero_sequencial.value).toBe(228)
    })

    test('brancos deve conter apenas espaços (evidência estrutural)', () => {
      const trailer = extractLineFields(trailerLine, bancoDoBrasilCnab400.trailer!)

      // Campo brancos deve ser vazio ou apenas espaços
      const brancosValue = String(trailer.brancos.value || '')
      expect(brancosValue.trim()).toBe('')
    })
  })

  describe('Particularidades do BB', () => {
    test('trailer do BB não tem totalizadores (diferente de outros bancos)', () => {
      const trailer = bancoDoBrasilCnab400.trailer!

      // O BB não tem campos de quantidade ou valor total no trailer
      expect(trailer.qtd_documentos).toBeUndefined()
      expect(trailer.valor_total).toBeUndefined()
    })

    test('campo brancos deve ser o maior campo do layout', () => {
      const trailer = bancoDoBrasilCnab400.trailer!

      // 393 caracteres de brancos (posição 2-394)
      expect(trailer.brancos.size).toBe(393)
    })
  })
})

