/**
 * Testes do Schema Caixa CNAB 400 - Header de Arquivo
 */

import { caixaCnab400 } from '@banks/caixa/schemas/cnab400'

describe('Schema Caixa CNAB 400 - Header de Arquivo', () => {
  describe('Definição dos campos', () => {
    const header = caixaCnab400.header!

    test('deve ter codigo_registro "0" (header) na posição 1', () => {
      expect(header.codigo_registro).toBeDefined()
      expect(header.codigo_registro.pos).toEqual([1, 1])
      expect(header.codigo_registro.type).toBe('num')
      expect(header.codigo_registro.size).toBe(1)
      expect(header.codigo_registro.pattern).toBe('0')
    })

    test('deve ter codigo_remessa "1" (remessa) na posição 2', () => {
      expect(header.codigo_remessa).toBeDefined()
      expect(header.codigo_remessa.pos).toEqual([2, 2])
      expect(header.codigo_remessa.type).toBe('num')
      expect(header.codigo_remessa.pattern).toBe('1')
    })

    test('deve ter literal "REMESSA" na posição 3-9', () => {
      expect(header.literal_remessa).toBeDefined()
      expect(header.literal_remessa.pos).toEqual([3, 9])
      expect(header.literal_remessa.type).toBe('alfa')
      expect(header.literal_remessa.size).toBe(7)
      expect(header.literal_remessa.pattern).toBe('REMESSA')
    })

    test('deve ter codigo_servico na posição 10-11', () => {
      expect(header.codigo_servico).toBeDefined()
      expect(header.codigo_servico.pos).toEqual([10, 11])
      expect(header.codigo_servico.type).toBe('num')
      expect(header.codigo_servico.size).toBe(2)
    })

    test('deve ter literal_servico "COBRANCA" na posição 12-26', () => {
      expect(header.literal_servico).toBeDefined()
      expect(header.literal_servico.pos).toEqual([12, 26])
      expect(header.literal_servico.type).toBe('alfa')
      expect(header.literal_servico.size).toBe(15)
      expect(header.literal_servico.pattern).toBe('COBRANCA')
    })

    test('deve ter codigo_agencia na posição 27-30', () => {
      expect(header.codigo_agencia).toBeDefined()
      expect(header.codigo_agencia.pos).toEqual([27, 30])
      expect(header.codigo_agencia.type).toBe('num')
      expect(header.codigo_agencia.size).toBe(4)
      expect(header.codigo_agencia.required).toBe(true)
    })

    test('deve ter codigo_beneficiario na posição 31-37 (7 dígitos)', () => {
      expect(header.codigo_beneficiario).toBeDefined()
      expect(header.codigo_beneficiario.pos).toEqual([31, 37])
      expect(header.codigo_beneficiario.type).toBe('num')
      expect(header.codigo_beneficiario.size).toBe(7)
      expect(header.codigo_beneficiario.required).toBe(true)
    })

    test('deve ter uso_exclusivo_1 na posição 38-46', () => {
      expect(header.uso_exclusivo_1).toBeDefined()
      expect(header.uso_exclusivo_1.pos).toEqual([38, 46])
      expect(header.uso_exclusivo_1.type).toBe('alfa')
      expect(header.uso_exclusivo_1.size).toBe(9)
    })

    test('deve ter nome_empresa na posição 47-76', () => {
      expect(header.nome_empresa).toBeDefined()
      expect(header.nome_empresa.pos).toEqual([47, 76])
      expect(header.nome_empresa.type).toBe('alfa')
      expect(header.nome_empresa.size).toBe(30)
      expect(header.nome_empresa.required).toBe(true)
    })

    test('deve ter codigo_banco na posição 77-79 com padrão "104"', () => {
      expect(header.codigo_banco).toBeDefined()
      expect(header.codigo_banco.pos).toEqual([77, 79])
      expect(header.codigo_banco.type).toBe('num')
      expect(header.codigo_banco.size).toBe(3)
      expect(header.codigo_banco.pattern).toBe('104')
    })

    test('deve ter nome_banco na posição 80-94', () => {
      expect(header.nome_banco).toBeDefined()
      expect(header.nome_banco.pos).toEqual([80, 94])
      expect(header.nome_banco.type).toBe('alfa')
      expect(header.nome_banco.size).toBe(15)
    })

    test('deve ter data_geracao na posição 95-100 com formato DDMMAA', () => {
      expect(header.data_geracao).toBeDefined()
      expect(header.data_geracao.pos).toEqual([95, 100])
      expect(header.data_geracao.type).toBe('data')
      expect(header.data_geracao.size).toBe(6)
      expect(header.data_geracao.dateFormat).toBe('DDMMAA')
    })

    test('deve ter versao_layout na posição 101-103', () => {
      expect(header.versao_layout).toBeDefined()
      expect(header.versao_layout.pos).toEqual([101, 103])
      expect(header.versao_layout.type).toBe('num')
      expect(header.versao_layout.size).toBe(3)
    })

    test('deve ter uso_exclusivo_2 na posição 104-389 (filler grande)', () => {
      expect(header.uso_exclusivo_2).toBeDefined()
      expect(header.uso_exclusivo_2.pos).toEqual([104, 389])
      expect(header.uso_exclusivo_2.type).toBe('alfa')
      expect(header.uso_exclusivo_2.size).toBe(286)
    })

    test('deve ter numero_sequencial_arquivo na posição 390-394', () => {
      expect(header.numero_sequencial_arquivo).toBeDefined()
      expect(header.numero_sequencial_arquivo.pos).toEqual([390, 394])
      expect(header.numero_sequencial_arquivo.type).toBe('num')
      expect(header.numero_sequencial_arquivo.size).toBe(5)
    })

    test('deve ter numero_sequencial na posição 395-400', () => {
      expect(header.numero_sequencial).toBeDefined()
      expect(header.numero_sequencial.pos).toEqual([395, 400])
      expect(header.numero_sequencial.type).toBe('num')
      expect(header.numero_sequencial.size).toBe(6)
    })
  })

  describe('Características específicas', () => {
    const header = caixaCnab400.header!

    test('deve ter 16 campos no total', () => {
      const campos = Object.keys(header)
      expect(campos.length).toBe(16)
    })

    test('codigo_beneficiario deve ter descrição mencionando NE004', () => {
      expect(header.codigo_beneficiario.description).toContain('NE004')
    })

    test('versao_layout deve mencionar que só existe na Caixa e Sicredi', () => {
      expect(header.versao_layout.description).toContain('Sicredi')
    })

    test('campos obrigatórios devem incluir identificação e datas', () => {
      expect(header.codigo_registro.required).toBe(true)
      expect(header.codigo_remessa.required).toBe(true)
      expect(header.literal_remessa.required).toBe(true)
      expect(header.nome_empresa.required).toBe(true)
      expect(header.codigo_banco.required).toBe(true)
      expect(header.data_geracao.required).toBe(true)
      expect(header.numero_sequencial.required).toBe(true)
    })

    test('uso_exclusivo_2 deve ser o maior campo do layout', () => {
      const campos = Object.keys(header)
      const tamanhos = campos.map((campo) => header[campo].size)
      const maiorTamanho = Math.max(...tamanhos)
      expect(header.uso_exclusivo_2.size).toBe(maiorTamanho)
      expect(maiorTamanho).toBe(286)
    })
  })
})


