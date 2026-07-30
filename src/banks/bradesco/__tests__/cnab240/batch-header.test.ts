/**
 * Testes do Header de Lote - Bradesco CNAB 240
 * 
 * Valida a estrutura e campos do Header de Lote.
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Tamanhos e decimais
 * 
 * NÃO testam regras de negócio (valores válidos, datas no passado, etc.)
 */

import { bradescoCnab240 } from '@banks/bradesco/schemas/cnab240'
import { extractLineFields } from '@parser/field-extractor'

describe('Schema Bradesco CNAB 240 - Header de Lote', () => {
  describe('Definição dos campos', () => {
    test('deve ter código do banco na posição 1-3 com padrão "237"', () => {
      const field = bradescoCnab240.headerLote!.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.pattern).toBe('237')
    })

    test('deve ter lote na posição 4-7', () => {
      const field = bradescoCnab240.headerLote!.controle_lote
      
      expect(field.pos).toEqual([4, 7])
      expect(field.type).toBe('num')
      expect(field.required).toBe(true)
    })

    test('deve ter tipo de registro "1" (header de lote) na posição 8', () => {
      const field = bradescoCnab240.headerLote!.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.pattern).toBe('1')
    })

    test('deve ter tipo de operação "R" (remessa) na posição 9', () => {
      const field = bradescoCnab240.headerLote!.servico_operacao
      
      expect(field.pos).toEqual([9, 9])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('R')
    })

    test('deve ter tipo de serviço "01" (cobrança) na posição 10-11', () => {
      const field = bradescoCnab240.headerLote!.servico_tipo
      
      expect(field.pos).toEqual([10, 11])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('01')
    })

    test('deve ter cnab exclusivo na posição 12-13', () => {
      const field = bradescoCnab240.headerLote!.cnab_exclusivo_1
      
      expect(field.pos).toEqual([12, 13])
      expect(field.type).toBe('alfa')
    })

    test('deve ter número da versão do layout na posição 14-16', () => {
      const field = bradescoCnab240.headerLote!.servico_layout
      
      expect(field.pos).toEqual([14, 16])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('042')
    })

    test('deve ter dados do cedente nas posições 18-73', () => {
      expect(bradescoCnab240.headerLote!.cnab_exclusivo_2.pos).toEqual([17, 17])
      expect(bradescoCnab240.headerLote!.cedente_inscricao_tipo.pos).toEqual([18, 18])
      expect(bradescoCnab240.headerLote!.cedente_inscricao_numero.pos).toEqual([19, 33])
      expect(bradescoCnab240.headerLote!.cedente_convenio.pos).toEqual([34, 53])
      expect(bradescoCnab240.headerLote!.cedente_agencia.pos).toEqual([54, 58])
      expect(bradescoCnab240.headerLote!.cedente_agencia_dv.pos).toEqual([59, 59])
      expect(bradescoCnab240.headerLote!.cedente_conta.pos).toEqual([60, 71])
      expect(bradescoCnab240.headerLote!.cedente_conta_dv.pos).toEqual([72, 72])
      expect(bradescoCnab240.headerLote!.cnab_exclusivo_3.pos).toEqual([73, 73])
    })

    test('deve ter nome do cedente na posição 74-103', () => {
      const field = bradescoCnab240.headerLote!.cedente_nome
      
      expect(field.pos).toEqual([74, 103])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(30)
    })

    test('deve ter informação 1 na posição 104-143', () => {
      const field = bradescoCnab240.headerLote!.informacao_1
      
      expect(field.pos).toEqual([104, 143])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
    })

    test('deve ter informação 2 na posição 144-183', () => {
      const field = bradescoCnab240.headerLote!.informacao_2
      
      expect(field.pos).toEqual([144, 183])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(40)
    })

    test('deve ter número de remessa/retorno na posição 184-191', () => {
      const field = bradescoCnab240.headerLote!.numero_remessa_retorno
      
      expect(field.pos).toEqual([184, 191])
      expect(field.type).toBe('num')
      expect(field.size).toBe(8)
      expect(field.required).toBe(true)
      expect(field.description).toContain('sequencial')
    })

    test('deve ter data de gravação na posição 192-199', () => {
      const field = bradescoCnab240.headerLote!.data_gravacao
      
      expect(field.pos).toEqual([192, 199])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAAAA')
      expect(field.required).toBe(true)
    })

    test('deve ter data de crédito na posição 200-207', () => {
      const field = bradescoCnab240.headerLote!.data_credito
      
      expect(field.pos).toEqual([200, 207])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAAAA')
    })

    test('deve ter 23 campos definidos no total', () => {
      const campos = Object.keys(bradescoCnab240.headerLote!)
      expect(campos.length).toBe(23)
    })
  })

  describe('Parsing de linha sintética', () => {
    test('deve extrair campos principais corretamente', () => {
      // Linha sintética de Header de Lote - construída com posições exatas
      let linha = ''
      linha += '237' // banco (pos 1-3) = 3 chars
      linha += '0001' // lote (pos 4-7) = 4 chars
      linha += '1' // tipo registro (pos 8) = 1 char
      linha += 'R' // operação (pos 9) = 1 char
      linha += '01' // tipo serviço (pos 10-11) = 2 chars
      linha += '00' // forma lançamento (pos 12-13) = 2 chars
      linha += '042' // versão layout (pos 14-16) = 3 chars
      linha += ' ' // cnab (pos 17) = 1 char
      linha += '2' // tipo inscrição (pos 18) = 1 char
      linha += '012345678901234' // número inscrição (pos 19-33) = 15 chars
      linha += '12345678901234567890' // convênio (pos 34-53) = 20 chars
      linha += '12345' // agência (pos 54-58) = 5 chars
      linha += '5' // agência DV (pos 59) = 1 char
      linha += '123456789012' // conta (pos 60-71) = 12 chars
      linha += '9' // conta DV (pos 72) = 1 char
      linha += '0' // agência/conta DV (pos 73) = 1 char
      linha += 'EMPRESA TESTE LTDA'.padEnd(30, ' ') // nome empresa (pos 74-103) = 30 chars
      linha += 'Mensagem 1'.padEnd(40, ' ') // msg 1 (pos 104-143) = 40 chars
      linha += 'Mensagem 2'.padEnd(40, ' ') // msg 2 (pos 144-183) = 40 chars
      linha += '00000001' // número remessa (pos 184-191) = 8 chars
      linha += '10072026' // data gravação (pos 192-199) = 8 chars
      linha += '00000000' // data crédito (pos 200-207) = 8 chars
      linha += ' '.repeat(33) // cnab até 240 (pos 208-240) = 33 chars

      // Verifica tamanho da linha
      expect(linha.length).toBe(240)

      const headerLote = extractLineFields(linha, bradescoCnab240.headerLote!)

      expect(headerLote.controle_banco.value).toBe(237)
      expect(headerLote.controle_lote.value).toBe(1)
      expect(headerLote.controle_registro.value).toBe(1)
      expect(headerLote.servico_operacao.value).toBe('R')
      expect(headerLote.servico_tipo.value).toBe(1)
      expect(headerLote.servico_layout.value).toBe(42)
      expect(headerLote.cedente_inscricao_tipo.value).toBe(2)
      expect(headerLote.cedente_agencia.value).toBe(12345)
      expect(headerLote.cedente_conta.value).toBe(123456789012)
      expect(headerLote.numero_remessa_retorno.value).toBe(1)
      expect(headerLote.data_gravacao.raw).toBe('10072026')
      expect(headerLote.cedente_nome.value).toContain('EMPRESA TESTE')
      expect(headerLote.informacao_1.value).toContain('Mensagem 1')
      
      expect(headerLote.controle_banco.error).toBeFalsy()
      expect(headerLote.numero_remessa_retorno.error).toBeFalsy()
    })

    test('deve extrair nome do cedente com padding correto', () => {
      const linha = '237'.padEnd(73, '0') + 
                    'ACME CORPORATION'.padEnd(30, ' ') + // pos 74-103
                    ''.padEnd(137, ' ') // resto até 240

      const headerLote = extractLineFields(linha, bradescoCnab240.headerLote!)

      expect(headerLote.cedente_nome.value).toContain('ACME CORPORATION')
      expect(headerLote.cedente_nome.error).toBeFalsy()
    })

    test('deve extrair informações corretamente', () => {
      const linha = '237'.padEnd(103, '0') + 
                    'NAO RECEBER APOS O VENCIMENTO           ' + // informacao 1, pos 104-143 (40 chars)
                    'PROTESTAR APOS 5 DIAS                   ' + // informacao 2, pos 144-183 (40 chars)
                    ''.padEnd(57, ' ') // resto até 240

      const headerLote = extractLineFields(linha, bradescoCnab240.headerLote!)

      expect(headerLote.informacao_1.value).toContain('NAO RECEBER APOS O VENCIMENTO')
      expect(headerLote.informacao_2.value).toContain('PROTESTAR APOS 5 DIAS')
      expect(headerLote.informacao_1.error).toBeFalsy()
      expect(headerLote.informacao_2.error).toBeFalsy()
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      const schema = bradescoCnab240.headerLote!
      
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
      const schema = bradescoCnab240.headerLote!
      
      Object.keys(schema).forEach(fieldName => {
        const field = schema[fieldName]
        const [inicio, fim] = field.pos
        const tamanhoCalculado = fim - inicio + 1
        
        expect(tamanhoCalculado).toBe(field.size)
      })
    })

    test('não deve haver sobreposição de posições', () => {
      const schema = bradescoCnab240.headerLote!
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
      const schema = bradescoCnab240.headerLote!
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

