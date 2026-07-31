/**
 * Testes do Schema Santander CNAB 400 - Header de Arquivo
 *
 * Parte 1: Definição dos campos (sem fixture)
 * Parte 2: Parsing de arquivo real
 */

import { santanderCnab400 } from '@banks/santander/schemas/cnab400'
import { extractLineFields } from '@parser/field-extractor'
import { readFixture } from './shared'

describe('Schema Santander CNAB 400 - Header de Arquivo', () => {
  describe('Definição dos campos', () => {
    const header = santanderCnab400.header!

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

    test('deve ter código de transmissão na posição 27-46', () => {
      expect(header.codigo_transmissao).toBeDefined()
      expect(header.codigo_transmissao.pos).toEqual([27, 46])
      expect(header.codigo_transmissao.type).toBe('alfa')
      expect(header.codigo_transmissao.size).toBe(20)
      expect(header.codigo_transmissao.required).toBe(true)
    })

    test('deve ter nome da empresa na posição 47-76', () => {
      expect(header.nome_empresa).toBeDefined()
      expect(header.nome_empresa.pos).toEqual([47, 76])
      expect(header.nome_empresa.type).toBe('alfa')
      expect(header.nome_empresa.size).toBe(30)
    })

    test('deve ter código do banco na posição 77-79 com padrão "033"', () => {
      expect(header.codigo_banco).toBeDefined()
      expect(header.codigo_banco.pos).toEqual([77, 79])
      expect(header.codigo_banco.type).toBe('num')
      expect(header.codigo_banco.size).toBe(3)
      expect(header.codigo_banco.pattern).toBe('033')
    })

    test('deve ter nome do banco na posição 80-94', () => {
      expect(header.nome_banco).toBeDefined()
      expect(header.nome_banco.pos).toEqual([80, 94])
      expect(header.nome_banco.type).toBe('alfa')
      expect(header.nome_banco.size).toBe(15)
      expect(header.nome_banco.pattern).toBe('SANTANDER')
    })

    test('deve ter data de geração na posição 95-100 com formato DDMMAA', () => {
      expect(header.data_geracao).toBeDefined()
      expect(header.data_geracao.pos).toEqual([95, 100])
      expect(header.data_geracao.type).toBe('data')
      expect(header.data_geracao.size).toBe(6)
      expect(header.data_geracao.dateFormat).toBe('DDMMAA')
    })

    test('deve ter zeros na posição 101-116', () => {
      expect(header.zeros).toBeDefined()
      expect(header.zeros.pos).toEqual([101, 116])
      expect(header.zeros.type).toBe('num')
      expect(header.zeros.size).toBe(16)
    })

    test('deve ter mensagem_1 na posição 117-163', () => {
      expect(header.mensagem_1).toBeDefined()
      expect(header.mensagem_1.pos).toEqual([117, 163])
      expect(header.mensagem_1.type).toBe('alfa')
      expect(header.mensagem_1.size).toBe(47)
    })

    test('deve ter mensagem_2 na posição 164-210', () => {
      expect(header.mensagem_2).toBeDefined()
      expect(header.mensagem_2.pos).toEqual([164, 210])
      expect(header.mensagem_2.type).toBe('alfa')
      expect(header.mensagem_2.size).toBe(47)
    })

    test('deve ter mensagem_3 na posição 211-257', () => {
      expect(header.mensagem_3).toBeDefined()
      expect(header.mensagem_3.pos).toEqual([211, 257])
      expect(header.mensagem_3.type).toBe('alfa')
      expect(header.mensagem_3.size).toBe(47)
    })

    test('deve ter mensagem_4 na posição 258-304', () => {
      expect(header.mensagem_4).toBeDefined()
      expect(header.mensagem_4.pos).toEqual([258, 304])
      expect(header.mensagem_4.type).toBe('alfa')
      expect(header.mensagem_4.size).toBe(47)
    })

    test('deve ter mensagem_5 na posição 305-351', () => {
      expect(header.mensagem_5).toBeDefined()
      expect(header.mensagem_5.pos).toEqual([305, 351])
      expect(header.mensagem_5.type).toBe('alfa')
      expect(header.mensagem_5.size).toBe(47)
    })

    test('deve ter reservado_1 na posição 352-385', () => {
      expect(header.reservado_1).toBeDefined()
      expect(header.reservado_1.pos).toEqual([352, 385])
      expect(header.reservado_1.type).toBe('alfa')
      expect(header.reservado_1.size).toBe(34)
    })

    test('deve ter reservado_2 na posição 386-391', () => {
      expect(header.reservado_2).toBeDefined()
      expect(header.reservado_2.pos).toEqual([386, 391])
      expect(header.reservado_2.type).toBe('alfa')
      expect(header.reservado_2.size).toBe(6)
    })

    test('deve ter número da versão na posição 392-394', () => {
      expect(header.numero_versao).toBeDefined()
      expect(header.numero_versao.pos).toEqual([392, 394])
      expect(header.numero_versao.type).toBe('alfa')
      expect(header.numero_versao.size).toBe(3)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(header.numero_sequencial).toBeDefined()
      expect(header.numero_sequencial.pos).toEqual([395, 400])
      expect(header.numero_sequencial.type).toBe('num')
      expect(header.numero_sequencial.size).toBe(6)
    })
  })

  describe('Parsing de arquivo real', () => {
    const lines = readFixture('SANTANDER_cnab_400_140.REM')
    const headerLine = lines[0]
    const headerFields = extractLineFields(headerLine, santanderCnab400.header!)

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

    test('deve extrair código de transmissão (20 caracteres)', () => {
      expect(headerFields.codigo_transmissao.raw).toBeDefined()
      expect(headerFields.codigo_transmissao.raw.length).toBe(20)
      // Valor esperado confirmado no arquivo (fixture com dados fictícios)
      expect(headerFields.codigo_transmissao.raw).toBe('99110022334400556677')
    })

    test('deve extrair nome da empresa', () => {
      expect(headerFields.nome_empresa.value).toBeDefined()
      expect(String(headerFields.nome_empresa.value).trim().length).toBeGreaterThan(0)
      // Valor confirmado no arquivo (fixture com dados fictícios)
      expect(String(headerFields.nome_empresa.value).trim()).toBe('COMERCIO EXEMPLO LTDA')
    })

    test('deve extrair código do banco "033"', () => {
      expect(headerFields.codigo_banco.raw).toBe('033')
    })

    test('deve extrair nome do banco "SANTANDER"', () => {
      expect(String(headerFields.nome_banco.value).trim()).toBe('SANTANDER')
    })

    test('deve extrair data de geração no formato DDMMAA', () => {
      expect(headerFields.data_geracao.raw).toBeDefined()
      expect(headerFields.data_geracao.raw.length).toBe(6)
      // Valor confirmado: 250526 (25/05/26)
      expect(headerFields.data_geracao.raw).toBe('250526')
    })

    test('numero_sequencial deve ser sempre 1 no header (evidência estrutural)', () => {
      expect(headerFields.numero_sequencial.value).toBe(1)
    })
  })
})

