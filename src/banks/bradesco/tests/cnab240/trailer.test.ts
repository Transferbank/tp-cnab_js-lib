/**
 * Testes do Trailer de Arquivo - Bradesco CNAB 240
 * 
 * Valida a estrutura e campos do Trailer de Arquivo (última linha, pos 8 = '9').
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Tamanhos e decimais
 * 
 * NÕO testam regras de negócio (valores válidos, consistência de totais, etc.)
 */

import { bradescoCnab240 } from '@banks/bradesco/schemas/cnab240'
import { extractLineFields } from '@parser/field-extractor'

describe('Schema Bradesco CNAB 240 - Trailer de Arquivo', () => {
  describe('Definição dos campos', () => {
    test('deve ter código do banco na posição 1-3 com padrão "237"', () => {
      const field = bradescoCnab240.trailerArquivo!.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('237')
    })

    test('deve ter lote "9999" na posição 4-7', () => {
      const field = bradescoCnab240.trailerArquivo!.controle_lote
      
      expect(field.pos).toEqual([4, 7])
      expect(field.pattern).toBe('9999')
    })

    test('deve ter tipo de registro "9" (trailer) na posição 8', () => {
      const field = bradescoCnab240.trailerArquivo!.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('9')
    })

    test('deve ter campo CNAB exclusivo na posição 9-17', () => {
      const field = bradescoCnab240.trailerArquivo!.cnab_exclusivo_1
      
      expect(field.pos).toEqual([9, 17])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(9)
      expect(field.required).toBe(false)
    })

    test('deve ter quantidade de lotes na posição 18-23', () => {
      const field = bradescoCnab240.trailerArquivo!.totais_quantidade_lotes
      
      expect(field.pos).toEqual([18, 23])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
      expect(field.description).toContain('lotes')
    })

    test('deve ter quantidade de registros na posição 24-29', () => {
      const field = bradescoCnab240.trailerArquivo!.totais_quantidade_registros
      
      expect(field.pos).toEqual([24, 29])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
      expect(field.description).toContain('registros')
    })

    test('deve ter quantidade de contas para conciliação na posição 30-35', () => {
      const field = bradescoCnab240.trailerArquivo!.totais_quantidade_contas_concil
      
      expect(field.pos).toEqual([30, 35])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(false)
      expect(field.description).toContain('contas')
    })

    test('deve ter campo CNAB exclusivo na posição 36-240', () => {
      const field = bradescoCnab240.trailerArquivo!.cnab_exclusivo_2
      
      expect(field.pos).toEqual([36, 240])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(205)
      expect(field.required).toBe(false)
    })

    test('deve ter 8 campos definidos no total', () => {
      const campos = Object.keys(bradescoCnab240.trailerArquivo!)
      expect(campos.length).toBe(8)
    })
  })

  describe('Parsing de linha sintética', () => {
    test('deve extrair totalizadores corretamente', () => {
      // Linha sintética de Trailer de Arquivo
      const linha = '237' + // banco (pos 1-3)
                    '9999' + // lote (pos 4-7)
                    '9' + // tipo registro (pos 8)
                    '         ' + // cnab (pos 9-17) - 9 chars
                    '000001' + // qtd lotes (pos 18-23)
                    '000042' + // qtd registros (pos 24-29)
                    '000000' + // qtd contas concil (pos 30-35)
                    ' '.repeat(205) // cnab até 240 (pos 36-240) - 205 chars

      const trailerArquivo = extractLineFields(linha, bradescoCnab240.trailerArquivo!)

      expect(trailerArquivo.controle_banco.value).toBe(237)
      expect(trailerArquivo.controle_lote.value).toBe(9999)
      expect(trailerArquivo.controle_registro.value).toBe(9)
      expect(trailerArquivo.totais_quantidade_lotes.value).toBe(1)
      expect(trailerArquivo.totais_quantidade_registros.value).toBe(42)
      expect(trailerArquivo.totais_quantidade_contas_concil.value).toBe(0)
      
      expect(trailerArquivo.controle_banco.error).toBeFalsy()
      expect(trailerArquivo.totais_quantidade_lotes.error).toBeFalsy()
      expect(trailerArquivo.totais_quantidade_registros.error).toBeFalsy()
    })

    test('deve extrair múltiplos lotes', () => {
      const linha = '237'.padEnd(17, '0') + 
                    '000005' + // 5 lotes (pos 18-23)
                    '000210' + // 210 registros (pos 24-29)
                    ''.padEnd(211, ' ') // resto até 240

      const trailerArquivo = extractLineFields(linha, bradescoCnab240.trailerArquivo!)

      expect(trailerArquivo.totais_quantidade_lotes.value).toBe(5)
      expect(trailerArquivo.totais_quantidade_registros.value).toBe(210)
      expect(trailerArquivo.totais_quantidade_lotes.error).toBeFalsy()
    })

    test('deve extrair quantidade de contas para conciliação', () => {
      const linha = '237'.padEnd(29, '0') + 
                    '000003' + // 3 contas (pos 30-35)
                    ''.padEnd(205, ' ') // resto até 240

      const trailerArquivo = extractLineFields(linha, bradescoCnab240.trailerArquivo!)

      expect(trailerArquivo.totais_quantidade_contas_concil.value).toBe(3)
      expect(trailerArquivo.totais_quantidade_contas_concil.error).toBeFalsy()
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      const schema = bradescoCnab240.trailerArquivo!
      
      Object.keys(schema).forEach(fieldName => {
        const field = schema[fieldName]
        
        expect(field.pos).toBeDefined()
        expect(field.pos.length).toBe(2)
        expect(field.type).toBeDefined()
        expect(field.size).toBeDefined()
        expect(field.size).toBeGreaterThan(0)
      })
    })

    test('tamanhos declarados devem bater com as posições', () => {
      const schema = bradescoCnab240.trailerArquivo!
      
      Object.keys(schema).forEach(fieldName => {
        const field = schema[fieldName]
        const [inicio, fim] = field.pos
        const tamanhoCalculado = fim - inicio + 1
        
        expect(tamanhoCalculado).toBe(field.size)
      })
    })

    test('não deve haver sobreposição de posições', () => {
      const schema = bradescoCnab240.trailerArquivo!
      const fieldNames = Object.keys(schema)
      
      for (let i = 0; i < fieldNames.length; i++) {
        const field1 = schema[fieldNames[i]]
        const [start1, end1] = field1.pos
        
        for (let j = i + 1; j < fieldNames.length; j++) {
          const field2 = schema[fieldNames[j]]
          const [start2, end2] = field2.pos
          
          // Verifica se não há sobreposição
          const overlap = !(end1 < start2 || end2 < start1)
          
          if (overlap) {
            fail(`Sobreposição detectada entre ${fieldNames[i]} (${start1}-${end1}) e ${fieldNames[j]} (${start2}-${end2})`)
          }
        }
      }
    })

    test('deve cobrir todas as 240 posições', () => {
      const schema = bradescoCnab240.trailerArquivo!
      const positions = new Array(240).fill(false)
      
      Object.keys(schema).forEach(fieldName => {
        const field = schema[fieldName]
        const [start, end] = field.pos
        
        for (let i = start - 1; i < end; i++) {
          positions[i] = true
        }
      })
      
      const uncoveredPositions = positions
        .map((covered, index) => (covered ? null : index + 1))
        .filter(pos => pos !== null)
      
      if (uncoveredPositions.length > 0) {
        fail(`Posições não cobertas: ${uncoveredPositions.join(', ')}`)
      }
      
      expect(uncoveredPositions.length).toBe(0)
    })
  })
})

