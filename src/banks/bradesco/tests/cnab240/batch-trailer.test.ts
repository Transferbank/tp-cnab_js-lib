/**
 * Testes do Trailer de Lote - Bradesco CNAB 240
 * 
 * Valida a estrutura e campos do Trailer de Lote.
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

describe('Schema Bradesco CNAB 240 - Trailer de Lote', () => {
  describe('Definição dos campos', () => {
    test('deve ter código do banco na posição 1-3 com padrão "237"', () => {
      const field = bradescoCnab240.trailerLote!.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('237')
    })

    test('deve ter lote na posição 4-7', () => {
      const field = bradescoCnab240.trailerLote!.controle_lote
      
      expect(field.pos).toEqual([4, 7])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter tipo de registro "5" (trailer de lote) na posição 8', () => {
      const field = bradescoCnab240.trailerLote!.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('5')
    })

    test('deve ter quantidade de registros na posição 18-23', () => {
      const field = bradescoCnab240.trailerLote!.quantidade_registros
      
      expect(field.pos).toEqual([18, 23])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(true)
    })

    test('deve ter quantidade de títulos em cobrança simples na posição 24-29', () => {
      const field = bradescoCnab240.trailerLote!.cobranca_simples_qtde_titulos
      
      expect(field.pos).toEqual([24, 29])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
    })

    test('deve ter valor de títulos em cobrança simples na posição 30-46 com 2 decimais', () => {
      const field = bradescoCnab240.trailerLote!.cobranca_simples_valor_total
      
      expect(field.pos).toEqual([30, 46])
      expect(field.type).toBe('num')
      expect(field.size).toBe(17)
      expect(field.decimals).toBe(2)
    })

    test('deve ter quantidade de títulos em cobrança vinculada na posição 47-52', () => {
      const field = bradescoCnab240.trailerLote!.cobranca_vinculada_qtde_titulos
      
      expect(field.pos).toEqual([47, 52])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
    })

    test('deve ter valor de títulos em cobrança vinculada na posição 53-69 com 2 decimais', () => {
      const field = bradescoCnab240.trailerLote!.cobranca_vinculada_valor_total
      
      expect(field.pos).toEqual([53, 69])
      expect(field.type).toBe('num')
      expect(field.size).toBe(17)
      expect(field.decimals).toBe(2)
    })

    test('deve ter quantidade de títulos em cobrança caucionada na posição 70-75', () => {
      const field = bradescoCnab240.trailerLote!.cobranca_caucionada_qtde_titulos
      
      expect(field.pos).toEqual([70, 75])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
    })

    test('deve ter valor de títulos em cobrança caucionada na posição 76-92 com 2 decimais', () => {
      const field = bradescoCnab240.trailerLote!.cobranca_caucionada_valor_total
      
      expect(field.pos).toEqual([76, 92])
      expect(field.type).toBe('num')
      expect(field.size).toBe(17)
      expect(field.decimals).toBe(2)
    })

    test('deve ter quantidade de títulos em cobrança descontada na posição 93-98', () => {
      const field = bradescoCnab240.trailerLote!.cobranca_descontada_qtde_titulos
      
      expect(field.pos).toEqual([93, 98])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
    })

    test('deve ter valor de títulos em cobrança descontada na posição 99-115 com 2 decimais', () => {
      const field = bradescoCnab240.trailerLote!.cobranca_descontada_valor_total
      
      expect(field.pos).toEqual([99, 115])
      expect(field.type).toBe('num')
      expect(field.size).toBe(17)
      expect(field.decimals).toBe(2)
    })

    test('deve ter aviso bancário na posição 116-123', () => {
      const field = bradescoCnab240.trailerLote!.numero_aviso_lancamento
      
      expect(field.pos).toEqual([116, 123])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(8)
    })

    test('todos os campos de valor devem ter 17 dígitos com 2 decimais', () => {
      const camposValor = [
        'cobranca_simples_valor_total',
        'cobranca_vinculada_valor_total',
        'cobranca_caucionada_valor_total',
        'cobranca_descontada_valor_total'
      ]

      camposValor.forEach(campoNome => {
        const field = bradescoCnab240.trailerLote![campoNome]
        expect(field.size).toBe(17)
        expect(field.decimals).toBe(2)
        expect(field.type).toBe('num')
      })
    })

    test('deve ter 15 campos definidos no total', () => {
      const campos = Object.keys(bradescoCnab240.trailerLote!)
      expect(campos.length).toBe(15)
    })
  })

  describe('Parsing de linha sintética', () => {
    test('deve extrair totalizadores corretamente', () => {
      // Linha sintética de Trailer de Lote
      const linha = '237' + // banco (pos 1-3)
                    '0001' + // lote (pos 4-7)
                    '5' + // tipo registro (pos 8)
                    ''.padEnd(9, ' ') + // cnab (pos 9-17)
                    '000010' + // qtd registros (pos 18-23)
                    '000005' + // qtd títulos simples (pos 24-29)
                    '00000000000150000' + // valor títulos simples (pos 30-46) = R$ 1.500,00
                    '000002' + // qtd títulos vinculada (pos 47-52)
                    '00000000000050000' + // valor títulos vinculada (pos 53-69) = R$ 500,00
                    '000001' + // qtd títulos caucionada (pos 70-75)
                    '00000000000025000' + // valor títulos caucionada (pos 76-92) = R$ 250,00
                    '000001' + // qtd títulos descontada (pos 93-98)
                    '00000000000010000' + // valor títulos descontada (pos 99-115) = R$ 100,00
                    ''.padEnd(125, ' ') // resto até 240

      const trailerLote = extractLineFields(linha, bradescoCnab240.trailerLote!)

      expect(trailerLote.controle_banco.value).toBe(237)
      expect(trailerLote.controle_lote.value).toBe(1)
      expect(trailerLote.controle_registro.value).toBe(5)
      expect(trailerLote.quantidade_registros.value).toBe(10)
      expect(trailerLote.cobranca_simples_qtde_titulos.value).toBe(5)
      expect(trailerLote.cobranca_simples_valor_total.value).toBe(1500.00)
      expect(trailerLote.cobranca_vinculada_qtde_titulos.value).toBe(2)
      expect(trailerLote.cobranca_vinculada_valor_total.value).toBe(500.00)
      expect(trailerLote.cobranca_caucionada_qtde_titulos.value).toBe(1)
      expect(trailerLote.cobranca_caucionada_valor_total.value).toBe(250.00)
      expect(trailerLote.cobranca_descontada_qtde_titulos.value).toBe(1)
      expect(trailerLote.cobranca_descontada_valor_total.value).toBe(100.00)
      
      expect(trailerLote.controle_banco.error).toBeFalsy()
      expect(trailerLote.quantidade_registros.error).toBeFalsy()
      expect(trailerLote.cobranca_simples_valor_total.error).toBeFalsy()
    })

    test('deve extrair valores com centavos corretamente', () => {
      const linha = '237'.padEnd(29, '0') + 
                    '00000000001234567' + // pos 30-46 = R$ 12.345,67
                    ''.padEnd(194, ' ') // resto até 240

      const trailerLote = extractLineFields(linha, bradescoCnab240.trailerLote!)

      expect(trailerLote.cobranca_simples_valor_total.value).toBe(12345.67)
      expect(trailerLote.cobranca_simples_valor_total.error).toBeFalsy()
    })

    test('deve extrair número de aviso bancário', () => {
      const linha = '237'.padEnd(115, '0') + 
                    '12345678' + // aviso bancário (pos 116-123)
                    ''.padEnd(117, ' ') // resto até 240

      const trailerLote = extractLineFields(linha, bradescoCnab240.trailerLote!)

      expect(trailerLote.numero_aviso_lancamento.value).toBe('12345678')
      expect(trailerLote.numero_aviso_lancamento.error).toBeFalsy()
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      const schema = bradescoCnab240.trailerLote!
      
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
      const schema = bradescoCnab240.trailerLote!
      
      Object.keys(schema).forEach(fieldName => {
        const field = schema[fieldName]
        const [inicio, fim] = field.pos
        const tamanhoCalculado = fim - inicio + 1
        
        expect(tamanhoCalculado).toBe(field.size)
      })
    })

    test('não deve haver sobreposição de posições', () => {
      const schema = bradescoCnab240.trailerLote!
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
      const schema = bradescoCnab240.trailerLote!
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

