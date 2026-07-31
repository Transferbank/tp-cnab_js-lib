/**
 * Testes do Segmento R - Bradesco CNAB 240
 * 
 * Valida a estrutura e campos do Segmento R (descontos adicionais, multa, débito automático).
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Tamanhos e decimais
 * 
 * NÕO testam regras de negócio (valores válidos, datas no passado, etc.)
 * 
 * NOTA: O Segmento R é opcional e aparece apenas quando há:
 * - Descontos adicionais (2º e 3º descontos)
 * - Multa configurada
 * - Débito automático em conta corrente
 */

import { bradescoCnab240 } from '@banks/bradesco/schemas/cnab240'
import { extractLineFields } from '@parser/field-extractor'

// Buscar segmento R de optionalRecords
const segmentoR = bradescoCnab240.optionalRecords?.find(r => r.identifier === 'R')?.schema
if (!segmentoR) {
  throw new Error('Segmento R não encontrado em optionalRecords')
}

describe('Schema Bradesco CNAB 240 - Segmento R', () => {
  describe('Definição dos campos', () => {
    test('deve ter código do banco na posição 1-3 com padrão "237"', () => {
      const field = segmentoR.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('237')
    })

    test('deve ter tipo de registro "3" (detalhe) na posição 8', () => {
      const field = segmentoR.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('3')
    })

    test('deve ter identificador do segmento "R" na posição 14', () => {
      const field = segmentoR.servico_segmento
      
      expect(field.pos).toEqual([14, 14])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('R')
    })

    test('deve ter código do segundo desconto na posição 18', () => {
      const field = segmentoR.desconto2_codigo
      
      expect(field.pos).toEqual([18, 18])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
    })

    test('deve ter data do segundo desconto na posição 19-26 com formato DDMMAAAA', () => {
      const field = segmentoR.desconto2_data
      
      expect(field.pos).toEqual([19, 26])
      expect(field.type).toBe('data')
      expect(field.size).toBe(8)
      expect(field.dateFormat).toBe('DDMMAAAA')
    })

    test('deve ter valor do segundo desconto na posição 27-41 com 2 decimais', () => {
      const field = segmentoR.desconto2_valor
      
      expect(field.pos).toEqual([27, 41])
      expect(field.type).toBe('num')
      expect(field.size).toBe(15)
      expect(field.decimals).toBe(2)
    })

    test('deve ter código do terceiro desconto na posição 42', () => {
      const field = segmentoR.desconto3_codigo
      
      expect(field.pos).toEqual([42, 42])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
    })

    test('deve ter data do terceiro desconto na posição 43-50 com formato DDMMAAAA', () => {
      const field = segmentoR.desconto3_data
      
      expect(field.pos).toEqual([43, 50])
      expect(field.type).toBe('data')
      expect(field.size).toBe(8)
      expect(field.dateFormat).toBe('DDMMAAAA')
    })

    test('deve ter valor do terceiro desconto na posição 51-65 com 2 decimais', () => {
      const field = segmentoR.desconto3_valor
      
      expect(field.pos).toEqual([51, 65])
      expect(field.type).toBe('num')
      expect(field.size).toBe(15)
      expect(field.decimals).toBe(2)
    })

    test('deve ter código da multa na posição 66', () => {
      const field = segmentoR.multa_codigo
      
      expect(field.pos).toEqual([66, 66])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
    })

    test('deve ter data da multa na posição 67-74 com formato DDMMAAAA', () => {
      const field = segmentoR.multa_data
      
      expect(field.pos).toEqual([67, 74])
      expect(field.type).toBe('data')
      expect(field.size).toBe(8)
      expect(field.dateFormat).toBe('DDMMAAAA')
    })

    test('deve ter valor da multa na posição 75-89 com 2 decimais', () => {
      const field = segmentoR.multa_valor
      
      expect(field.pos).toEqual([75, 89])
      expect(field.type).toBe('num')
      expect(field.size).toBe(15)
      expect(field.decimals).toBe(2)
    })

    test('deve ter informação ao sacado (linhas 1-3) nas posições 90-179', () => {
      expect(segmentoR.informacao_sacado_1.pos).toEqual([90, 99])
      expect(segmentoR.informacao_sacado_2.pos).toEqual([100, 139])
      expect(segmentoR.informacao_sacado_3.pos).toEqual([140, 179])
      
      expect(segmentoR.informacao_sacado_1.type).toBe('alfa')
      expect(segmentoR.informacao_sacado_2.type).toBe('alfa')
      expect(segmentoR.informacao_sacado_3.type).toBe('alfa')
    })

    test('deve ter campos de débito automático nas posições 208-231', () => {
      expect(segmentoR.debito_automatico_banco.pos).toEqual([208, 210])
      expect(segmentoR.debito_automatico_agencia.pos).toEqual([211, 215])
      expect(segmentoR.debito_automatico_agencia_dv.pos).toEqual([216, 216])
      expect(segmentoR.debito_automatico_conta.pos).toEqual([217, 228])
      expect(segmentoR.debito_automatico_conta_dv.pos).toEqual([229, 229])
      expect(segmentoR.debito_automatico_agencia_conta_dv.pos).toEqual([230, 230])
      expect(segmentoR.aviso_debito_automatico.pos).toEqual([231, 231])
    })
  })

  describe('Parsing de linha sintética', () => {
    test('deve extrair campos de desconto corretamente', () => {
      // Linha sintética com segundo desconto de R$ 50,00 em 15/12/2025
      const linha = '237' + 
                    '0000' + // lote (pos 4-7)
                    '3' + // tipo registro (pos 8)
                    '00000' + // numero registro (pos 9-13)
                    'R' + // segmento (pos 14)
                    ' ' + // cnab (pos 15)
                    '01' + // codigo movimento (pos 16-17)
                    '1' + // desconto2_codigo (pos 18)
                    '15122025' + // desconto2_data (pos 19-26)
                    '000000000005000' + // desconto2_valor (pos 27-41) = R$ 50,00
                    '0'.padEnd(199, ' ') // resto da linha até 240

      const segR = extractLineFields(linha, segmentoR)

      expect(segR.servico_segmento.value).toBe('R')
      expect(segR.desconto2_codigo.value).toBe(1)
      expect(segR.desconto2_data.raw).toBe('15122025')
      expect(segR.desconto2_valor.value).toBe(50.00)
      expect(segR.desconto2_valor.error).toBeFalsy()
    })

    test('deve extrair campos de multa corretamente', () => {
      // Linha sintética com multa de 2% a partir de 16/12/2025
      const linha = '237'.padEnd(65, '0') + 
                    '2' + // multa_codigo (pos 66) - percentual
                    '16122025' + // multa_data (pos 67-74)
                    '000000000000200' + // multa_valor (pos 75-89) = 2,00%
                    '0'.padEnd(151, ' ') // resto da linha até 240

      const segR = extractLineFields(linha, segmentoR)

      expect(segR.multa_codigo.value).toBe(2)
      expect(segR.multa_data.raw).toBe('16122025')
      expect(segR.multa_valor.value).toBe(2.00)
      expect(segR.multa_valor.error).toBeFalsy()
    })

    test('deve extrair informações ao sacado', () => {
      const linha = '237'.padEnd(89, '0') + 
                    'Desconto'.padEnd(10, ' ') + // informacao_sacado_1 (pos 90-99)
                    'pagamento antecipado'.padEnd(40, ' ') + // informacao_sacado_2 (pos 100-139)
                    'válido até o vencimento'.padEnd(40, ' ') + // informacao_sacado_3 (pos 140-179)
                    '0'.padEnd(61, ' ') // resto da linha até 240

      const segR = extractLineFields(linha, segmentoR)

      expect(segR.informacao_sacado_1.value).toContain('Desconto')
      expect(segR.informacao_sacado_2.value).toContain('pagamento antecipado')
      expect(segR.informacao_sacado_3.value).toContain('válido até o vencimento')
      expect(segR.informacao_sacado_1.error).toBeFalsy()
    })

    test('deve extrair campos de débito automático', () => {
      const linha = '237'.padEnd(207, '0') + 
                    '237' + // debito_automatico_banco (pos 208-210)
                    '01234' + // debito_automatico_agencia (pos 211-215)
                    '5' + // debito_automatico_agencia_dv (pos 216)
                    '000012345678' + // debito_automatico_conta (pos 217-228)
                    '9' + // debito_automatico_conta_dv (pos 229)
                    '0' + // debito_automatico_agencia_conta_dv (pos 230)
                    '1' + // aviso_debito_automatico (pos 231)
                    '0'.padEnd(9, ' ') // resto da linha até 240

      const segR = extractLineFields(linha, segmentoR)

      expect(segR.debito_automatico_banco.value).toBe(237)
      expect(segR.debito_automatico_agencia.value).toBe(1234)
      expect(segR.debito_automatico_agencia_dv.value).toBe('5')
      expect(segR.debito_automatico_conta.value).toBe(12345678)
      expect(segR.debito_automatico_conta_dv.value).toBe('9')
      expect(segR.aviso_debito_automatico.value).toBe(1)
      expect(segR.debito_automatico_banco.error).toBeFalsy()
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      const schema = segmentoR
      
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
      const schema = segmentoR
      
      Object.keys(schema).forEach(fieldName => {
        const field = schema[fieldName]
        const [inicio, fim] = field.pos
        const tamanhoCalculado = fim - inicio + 1
        
        expect(tamanhoCalculado).toBe(field.size)
      })
    })

    test('não deve haver sobreposição de posições', () => {
      const schema = segmentoR
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
  })
})

