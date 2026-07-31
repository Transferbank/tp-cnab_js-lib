/**
 * Testes do Header de Arquivo - Bradesco CNAB 240
 * 
 * Valida a estrutura e campos do Header de Arquivo (primeira linha, pos 8 = '0').
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
import { readFixture } from './shared'
import { loadCnab240Metadata } from '../test-helpers'

describe('Schema Bradesco CNAB 240 - Header de Arquivo', () => {
  describe('Definição dos campos', () => {
    test('deve ter código do banco na posição 1-3 com padrão "237"', () => {
      const field = bradescoCnab240.headerArquivo!.controle_banco
      
      expect(field.pos).toEqual([1, 3])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('237')
      expect(field.required).toBe(true)
    })

    test('deve ter lote "0000" na posição 4-7', () => {
      const field = bradescoCnab240.headerArquivo!.controle_lote
      
      expect(field.pos).toEqual([4, 7])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('0000')
    })

    test('deve ter tipo de registro "0" (header) na posição 8', () => {
      const field = bradescoCnab240.headerArquivo!.controle_registro
      
      expect(field.pos).toEqual([8, 8])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('0')
      expect(field.required).toBe(true)
    })

    test('deve ter campo CNAB exclusivo na posição 9-17', () => {
      const field = bradescoCnab240.headerArquivo!.cnab_exclusivo_1
      
      expect(field.pos).toEqual([9, 17])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(9)
      expect(field.required).toBe(false)
    })

    test('deve ter dados do cedente nas posições 18-72', () => {
      expect(bradescoCnab240.headerArquivo!.cedente_inscricao_tipo.pos).toEqual([18, 18])
      expect(bradescoCnab240.headerArquivo!.cedente_inscricao_numero.pos).toEqual([19, 32])
      expect(bradescoCnab240.headerArquivo!.cedente_convenio.pos).toEqual([33, 52])
      expect(bradescoCnab240.headerArquivo!.cedente_agencia.pos).toEqual([53, 57])
      expect(bradescoCnab240.headerArquivo!.cedente_agencia_dv.pos).toEqual([58, 58])
      expect(bradescoCnab240.headerArquivo!.cedente_conta.pos).toEqual([59, 70])
      expect(bradescoCnab240.headerArquivo!.cedente_conta_dv.pos).toEqual([71, 71])
      expect(bradescoCnab240.headerArquivo!.cnab_exclusivo_2.pos).toEqual([72, 72])
    })

    test('deve ter tipo de inscrição do cedente na posição 18', () => {
      const field = bradescoCnab240.headerArquivo!.cedente_inscricao_tipo
      
      expect(field.pos).toEqual([18, 18])
      expect(field.type).toBe('num')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
      expect(field.description).toContain('CPF')
      expect(field.description).toContain('CNPJ')
    })

    test('deve ter número de inscrição do cedente na posição 19-32', () => {
      const field = bradescoCnab240.headerArquivo!.cedente_inscricao_numero
      
      expect(field.pos).toEqual([19, 32])
      expect(field.type).toBe('num')
      expect(field.size).toBe(14)
      expect(field.required).toBe(true)
    })

    test('deve ter convênio do cedente na posição 33-52', () => {
      const field = bradescoCnab240.headerArquivo!.cedente_convenio
      
      expect(field.pos).toEqual([33, 52])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(20)
      expect(field.required).toBe(true)
      expect(field.description).toContain('convênio')
    })

    test('deve ter agência do cedente na posição 53-57', () => {
      const field = bradescoCnab240.headerArquivo!.cedente_agencia
      
      expect(field.pos).toEqual([53, 57])
      expect(field.type).toBe('num')
      expect(field.size).toBe(5)
      expect(field.required).toBe(true)
    })

    test('deve ter dígito verificador da agência na posição 58', () => {
      const field = bradescoCnab240.headerArquivo!.cedente_agencia_dv
      
      expect(field.pos).toEqual([58, 58])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(false)
    })

    test('deve ter conta corrente do cedente na posição 59-70', () => {
      const field = bradescoCnab240.headerArquivo!.cedente_conta
      
      expect(field.pos).toEqual([59, 70])
      expect(field.type).toBe('num')
      expect(field.size).toBe(12)
      expect(field.required).toBe(true)
    })

    test('deve ter dígito verificador da conta na posição 71', () => {
      const field = bradescoCnab240.headerArquivo!.cedente_conta_dv
      
      expect(field.pos).toEqual([71, 71])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(1)
      expect(field.required).toBe(true)
    })

    test('deve ter campo cedente_nome na posição 73-102', () => {
      const field = bradescoCnab240.headerArquivo!.cedente_nome
      
      expect(field.pos).toEqual([73, 102])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(30)
      expect(field.required).toBe(true)
    })

    test('deve ter nome do banco na posição 103-132', () => {
      const field = bradescoCnab240.headerArquivo!.nome_do_banco
      
      expect(field.pos).toEqual([103, 132])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(30)
      expect(field.required).toBe(false)
      expect(field.description).toContain('banco')
    })

    test('deve ter campo CNAB exclusivo na posição 133-142', () => {
      const field = bradescoCnab240.headerArquivo!.cnab_exclusivo_3
      
      expect(field.pos).toEqual([133, 142])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(10)
      expect(field.required).toBe(false)
    })

    test('deve ter código de remessa "1" na posição 143', () => {
      const field = bradescoCnab240.headerArquivo!.arquivo_codigo
      
      expect(field.pos).toEqual([143, 143])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('1')
    })

    test('deve ter data de geração na posição 144-151 com formato DDMMAAAA', () => {
      const field = bradescoCnab240.headerArquivo!.arquivo_data_de_geracao
      
      expect(field.pos).toEqual([144, 151])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAAAA')
      expect(field.required).toBe(true)
    })

    test('deve ter hora de geração na posição 152-157', () => {
      const field = bradescoCnab240.headerArquivo!.arquivo_hora_de_geracao
      
      expect(field.pos).toEqual([152, 157])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(false)
      expect(field.description).toContain('HHMMSS')
    })

    test('deve ter sequencial do arquivo na posição 158-163 (NÃO é o sequencial de remessa)', () => {
      const field = bradescoCnab240.headerArquivo!.arquivo_sequencia
      
      expect(field.pos).toEqual([158, 163])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.required).toBe(false)
      expect(field.description).toContain('NÃO é o número sequencial de remessa')
      expect(field.description).toContain('numero_remessa_retorno')
      expect(field.description).toContain('Header de Lote')
    })

    test('deve ter versão do layout "084" na posição 164-166', () => {
      const field = bradescoCnab240.headerArquivo!.arquivo_layout
      
      expect(field.pos).toEqual([164, 166])
      expect(field.type).toBe('num')
      expect(field.size).toBe(3)
      expect(field.pattern).toBe('084')
      expect(field.required).toBe(true)
    })

    test('deve ter densidade de gravação na posição 167-171', () => {
      const field = bradescoCnab240.headerArquivo!.arquivo_densidade
      
      expect(field.pos).toEqual([167, 171])
      expect(field.type).toBe('num')
      expect(field.size).toBe(5)
      expect(field.required).toBe(false)
      expect(field.description).toContain('legado')
    })

    test('deve ter campo reservado para o banco na posição 172-191', () => {
      const field = bradescoCnab240.headerArquivo!.reservado_banco
      
      expect(field.pos).toEqual([172, 191])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(20)
      expect(field.required).toBe(false)
      expect(field.description).toContain('banco')
    })

    test('deve ter campo reservado para a empresa na posição 192-211', () => {
      const field = bradescoCnab240.headerArquivo!.reservado_empresa
      
      expect(field.pos).toEqual([192, 211])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(20)
      expect(field.required).toBe(false)
      expect(field.description).toContain('empresa')
    })

    test('deve ter campo CNAB exclusivo na posição 212-240', () => {
      const field = bradescoCnab240.headerArquivo!.cnab_exclusivo_4
      
      expect(field.pos).toEqual([212, 240])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(29)
      expect(field.required).toBe(false)
    })

    test('deve ter 24 campos definidos no total', () => {
      const campos = Object.keys(bradescoCnab240.headerArquivo!)
      expect(campos.length).toBe(24)
    })
  })

  describe('Parsing de linha sintética', () => {
    test('deve extrair campos principais corretamente', () => {
      // Linha sintética de Header de Arquivo
      let linha = ''
      linha += '237' // banco (pos 1-3)
      linha += '0000' // lote (pos 4-7)
      linha += '0' // tipo registro (pos 8)
      linha += ' '.repeat(9) // cnab (pos 9-17) - 9 chars
      linha += '2' // tipo inscrição (pos 18) - CNPJ
      linha += '01234567890123' // número inscrição (pos 19-32) - 14 chars
      linha += '12345678901234567890' // convênio (pos 33-52) - 20 chars
      linha += '12345' // agência (pos 53-57) - 5 chars
      linha += '5' // agência DV (pos 58)
      linha += '123456789012' // conta (pos 59-70) - 12 chars
      linha += '9' // conta DV (pos 71)
      linha += ' ' // cnab (pos 72)
      linha += 'EMPRESA TESTE LTDA'.padEnd(30, ' ') // nome cedente (pos 73-102) - 30 chars
      linha += 'BRADESCO'.padEnd(30, ' ') // nome banco (pos 103-132) - 30 chars
      linha += ' '.repeat(10) // cnab (pos 133-142) - 10 chars
      linha += '1' // código arquivo (pos 143) - remessa
      linha += '10072026' // data geração (pos 144-151)
      linha += '143000' // hora geração (pos 152-157)
      linha += '000001' // sequencial arquivo (pos 158-163)
      linha += '084' // layout (pos 164-166)
      linha += '00000' // densidade (pos 167-171)
      linha += ' '.repeat(20) // reservado banco (pos 172-191)
      linha += ' '.repeat(20) // reservado empresa (pos 192-211)
      linha += ' '.repeat(29) // cnab (pos 212-240)

      // Verifica tamanho da linha
      expect(linha.length).toBe(240)

      const headerArquivo = extractLineFields(linha, bradescoCnab240.headerArquivo!)

      expect(headerArquivo.controle_banco.value).toBe(237)
      expect(headerArquivo.controle_lote.value).toBe(0)
      expect(headerArquivo.controle_registro.value).toBe(0)
      expect(headerArquivo.cedente_inscricao_tipo.value).toBe(2)
      expect(headerArquivo.cedente_inscricao_numero.value).toBe(1234567890123)
      expect(headerArquivo.cedente_agencia.value).toBe(12345)
      expect(headerArquivo.cedente_conta.value).toBe(123456789012)
      expect(headerArquivo.cedente_conta_dv.value).toBe('9')
      expect(headerArquivo.cedente_nome.value).toContain('EMPRESA TESTE')
      expect(headerArquivo.nome_do_banco.value).toContain('BRADESCO')
      expect(headerArquivo.arquivo_codigo.value).toBe(1)
      expect(headerArquivo.arquivo_data_de_geracao.raw).toBe('10072026')
      expect(headerArquivo.arquivo_hora_de_geracao.value).toBe(143000)
      expect(headerArquivo.arquivo_sequencia.value).toBe(1)
      expect(headerArquivo.arquivo_layout.value).toBe(84)
      
      expect(headerArquivo.controle_banco.error).toBeFalsy()
      expect(headerArquivo.arquivo_data_de_geracao.error).toBeFalsy()
    })

    test('deve extrair dados do cedente com CPF', () => {
      const linha = '237'.padEnd(17, '0') + 
                    '1' + // tipo inscrição = CPF (pos 18)
                    '01234567890000' + // CPF (pos 19-32)
                    ''.padEnd(208, ' ') // resto até 240

      const headerArquivo = extractLineFields(linha, bradescoCnab240.headerArquivo!)

      expect(headerArquivo.cedente_inscricao_tipo.value).toBe(1)
      expect(headerArquivo.cedente_inscricao_numero.value).toBe(1234567890000)
      expect(headerArquivo.cedente_inscricao_tipo.error).toBeFalsy()
    })

    test('deve extrair hora de geração', () => {
      const linha = '237'.padEnd(151, '0') + 
                    '235959' + // 23:59:59 (pos 152-157)
                    ''.padEnd(83, ' ') // resto até 240

      const headerArquivo = extractLineFields(linha, bradescoCnab240.headerArquivo!)

      expect(headerArquivo.arquivo_hora_de_geracao.value).toBe(235959)
      expect(headerArquivo.arquivo_hora_de_geracao.error).toBeFalsy()
    })
  })

  describe('Parsing de arquivo real', () => {
    let lines: string[]

    beforeAll(() => {
      lines = readFixture('remessa-multipla.txt')
    })

    test('deve extrair código do banco "237"', () => {
      const header = extractLineFields(lines[0], bradescoCnab240.headerArquivo!)
      
      expect(header.controle_banco.raw).toBe('237')
      expect(header.controle_banco.error).toBeFalsy()
    })

    test('deve extrair nome da empresa (do JSON)', () => {
      const header = extractLineFields(lines[0], bradescoCnab240.headerArquivo!)
      const metadata = loadCnab240Metadata()
      
      if (metadata.header?.cedenteNome) {
        expect(header.cedente_nome.value).toMatch(new RegExp(metadata.header.cedenteNome))
      }
      expect(header.cedente_nome.error).toBeFalsy()
    })

    test('deve extrair data de geração (do JSON)', () => {
      const header = extractLineFields(lines[0], bradescoCnab240.headerArquivo!)
      const metadata = loadCnab240Metadata()
      
      if (metadata.header?.dataGeracaoRaw) {
        expect(header.arquivo_data_de_geracao.raw).toBe(metadata.header.dataGeracaoRaw)
      }
      expect(header.arquivo_data_de_geracao.error).toBeFalsy()
    })
  })

  describe('Validação de estrutura', () => {
    test('todos os campos devem ter posição, tipo e tamanho definidos', () => {
      const schema = bradescoCnab240.headerArquivo!
      
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
      const schema = bradescoCnab240.headerArquivo!
      
      Object.keys(schema).forEach(fieldName => {
        const field = schema[fieldName]
        const [inicio, fim] = field.pos
        const tamanhoCalculado = fim - inicio + 1
        
        expect(tamanhoCalculado).toBe(field.size)
      })
    })

    test('não deve haver sobreposição de posições', () => {
      const schema = bradescoCnab240.headerArquivo!
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
      const schema = bradescoCnab240.headerArquivo!
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

