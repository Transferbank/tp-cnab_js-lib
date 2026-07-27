/**
 * Testes do Schema Itaú CNAB 400 - Header de Arquivo
 *
 * Parte 1: Definição dos campos (sem fixture)
 * Parte 2: Parsing de arquivo real
 */

import { itauCnab400 } from '../../../../../src/banks/itau/schemas/cnab400'
import { extractLineFields } from '../../../../../src/parser/field-extractor'
import { readFixture } from './shared'

describe('Schema Itaú CNAB 400 - Header de Arquivo', () => {
  describe('Definição dos campos', () => {
    const header = itauCnab400.header!

    test('deve ter tipo de registro "0" (header) na posição 1', () => {
      expect(header.tipo_registro).toBeDefined()
      expect(header.tipo_registro.pos).toEqual([1, 1])
      expect(header.tipo_registro.type).toBe('num')
      expect(header.tipo_registro.size).toBe(1)
      expect(header.tipo_registro.pattern).toBe('0')
    })

    test('deve ter tipo de operação "1" (remessa) na posição 2', () => {
      expect(header.tipo_operacao).toBeDefined()
      expect(header.tipo_operacao.pos).toEqual([2, 2])
      expect(header.tipo_operacao.type).toBe('num')
      expect(header.tipo_operacao.pattern).toBe('1')
    })

    test('deve ter literal "REMESSA" na posição 3-9', () => {
      expect(header.literal_remessa).toBeDefined()
      expect(header.literal_remessa.pos).toEqual([3, 9])
      expect(header.literal_remessa.type).toBe('alfa')
      expect(header.literal_remessa.size).toBe(7)
      expect(header.literal_remessa.pattern).toBe('REMESSA')
    })

    test('deve ter código de serviço na posição 10-11', () => {
      expect(header.codigo_servico).toBeDefined()
      expect(header.codigo_servico.pos).toEqual([10, 11])
      expect(header.codigo_servico.type).toBe('num')
      expect(header.codigo_servico.size).toBe(2)
      expect(header.codigo_servico.pattern).toBe('01')
    })

    test('deve ter literal serviço na posição 12-26', () => {
      expect(header.literal_servico).toBeDefined()
      expect(header.literal_servico.pos).toEqual([12, 26])
      expect(header.literal_servico.type).toBe('alfa')
      expect(header.literal_servico.size).toBe(15)
      expect(header.literal_servico.pattern).toBe('COBRANCA')
    })

    test('deve ter agência na posição 27-30', () => {
      expect(header.agencia).toBeDefined()
      expect(header.agencia.pos).toEqual([27, 30])
      expect(header.agencia.type).toBe('num')
      expect(header.agencia.size).toBe(4)
    })

    test('deve ter zeros na posição 31-32', () => {
      expect(header.zeros).toBeDefined()
      expect(header.zeros.pos).toEqual([31, 32])
      expect(header.zeros.type).toBe('num')
      expect(header.zeros.size).toBe(2)
      expect(header.zeros.pattern).toBe('00')
    })

    test('deve ter conta na posição 33-37', () => {
      expect(header.conta).toBeDefined()
      expect(header.conta.pos).toEqual([33, 37])
      expect(header.conta.type).toBe('num')
      expect(header.conta.size).toBe(5)
    })

    test('deve ter DAC na posição 38', () => {
      expect(header.dac).toBeDefined()
      expect(header.dac.pos).toEqual([38, 38])
      expect(header.dac.type).toBe('alfa')
      expect(header.dac.size).toBe(1)
    })

    test('deve ter brancos na posição 39-46', () => {
      expect(header.brancos_1).toBeDefined()
      expect(header.brancos_1.pos).toEqual([39, 46])
      expect(header.brancos_1.type).toBe('alfa')
      expect(header.brancos_1.size).toBe(8)
    })

    test('deve ter nome da empresa na posição 47-76', () => {
      expect(header.nome_empresa).toBeDefined()
      expect(header.nome_empresa.pos).toEqual([47, 76])
      expect(header.nome_empresa.type).toBe('alfa')
      expect(header.nome_empresa.size).toBe(30)
    })

    test('deve ter código do banco na posição 77-79 com padrão "341"', () => {
      expect(header.codigo_banco).toBeDefined()
      expect(header.codigo_banco.pos).toEqual([77, 79])
      expect(header.codigo_banco.type).toBe('num')
      expect(header.codigo_banco.size).toBe(3)
      expect(header.codigo_banco.pattern).toBe('341')
    })

    test('deve ter nome do banco na posição 80-94', () => {
      expect(header.nome_banco).toBeDefined()
      expect(header.nome_banco.pos).toEqual([80, 94])
      expect(header.nome_banco.type).toBe('alfa')
      expect(header.nome_banco.size).toBe(15)
      expect(header.nome_banco.pattern).toBe('BANCO ITAU SA')
    })

    test('deve ter data de geração na posição 95-100 com formato DDMMAA', () => {
      expect(header.data_geracao).toBeDefined()
      expect(header.data_geracao.pos).toEqual([95, 100])
      expect(header.data_geracao.type).toBe('data')
      expect(header.data_geracao.size).toBe(6)
      expect(header.data_geracao.dateFormat).toBe('DDMMAA')
    })

    test('deve ter brancos na posição 101-394', () => {
      expect(header.brancos_2).toBeDefined()
      expect(header.brancos_2.pos).toEqual([101, 394])
      expect(header.brancos_2.type).toBe('alfa')
      expect(header.brancos_2.size).toBe(294)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(header.numero_sequencial).toBeDefined()
      expect(header.numero_sequencial.pos).toEqual([395, 400])
      expect(header.numero_sequencial.type).toBe('num')
      expect(header.numero_sequencial.size).toBe(6)
    })
  })

  describe('Parsing de arquivo real', () => {
    const lines = readFixture('ITAU_cnab_400.REM')
    const headerLine = lines[0]
    const headerFields = extractLineFields(headerLine, itauCnab400.header!)

    test('deve extrair tipo de registro "0" (header)', () => {
      expect(headerFields.tipo_registro.raw).toBe('0')
    })

    test('deve extrair tipo de operação "1" (remessa)', () => {
      expect(headerFields.tipo_operacao.raw).toBe('1')
    })

    test('deve extrair literal "REMESSA"', () => {
      expect(headerFields.literal_remessa.value).toBe('REMESSA')
    })

    test('deve extrair código de serviço "01"', () => {
      expect(headerFields.codigo_servico.raw).toBe('01')
    })

    test('deve extrair literal serviço "COBRANCA"', () => {
      expect(String(headerFields.literal_servico.value).trim()).toBe('COBRANCA')
    })

    test('deve extrair agência (4 dígitos)', () => {
      expect(headerFields.agencia.raw).toBeDefined()
      expect(headerFields.agencia.raw.length).toBe(4)
      // Valor esperado: 4521
      expect(headerFields.agencia.raw).toBe('4521')
    })

    test('deve extrair zeros "00"', () => {
      expect(headerFields.zeros.raw).toBe('00')
    })

    test('deve extrair conta (5 dígitos)', () => {
      expect(headerFields.conta.raw).toBeDefined()
      expect(headerFields.conta.raw.length).toBe(5)
      // Valor esperado: 54321
      expect(headerFields.conta.raw).toBe('54321')
    })

    test('deve extrair DAC (1 dígito)', () => {
      expect(headerFields.dac.raw).toBeDefined()
      expect(headerFields.dac.raw.length).toBe(1)
      // Valor esperado: 8
      expect(headerFields.dac.raw).toBe('8')
    })

    test('deve extrair nome da empresa', () => {
      expect(headerFields.nome_empresa.value).toBeDefined()
      expect(String(headerFields.nome_empresa.value).trim().length).toBeGreaterThan(0)
      // Valor confirmado no arquivo (fixture com dados fictícios)
      expect(String(headerFields.nome_empresa.value).trim()).toBe('EMPRESA EXEMPLO IMPORT LTDA')
    })

    test('deve extrair código do banco "341"', () => {
      expect(headerFields.codigo_banco.raw).toBe('341')
    })

    test('deve extrair nome do banco "BANCO ITAU SA"', () => {
      expect(String(headerFields.nome_banco.value).trim()).toBe('BANCO ITAU SA')
    })

    test('deve extrair data de geração no formato DDMMAA', () => {
      expect(headerFields.data_geracao.raw).toBeDefined()
      expect(headerFields.data_geracao.raw.length).toBe(6)
      // Valor confirmado: 020726 (02/07/26)
      expect(headerFields.data_geracao.raw).toBe('020726')
    })

    test('numero_sequencial deve ser sempre 1 no header (evidência estrutural)', () => {
      expect(headerFields.numero_sequencial.value).toBe(1)
    })
  })
})
