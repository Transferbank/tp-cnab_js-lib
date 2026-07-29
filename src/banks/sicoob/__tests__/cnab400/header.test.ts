/**
 * Testes do Schema Sicoob CNAB 400 - Header de Arquivo
 */

import { sicoobCnab400 } from '@banks/sicoob/schemas/cnab400'

describe('Schema Sicoob CNAB 400 - Header de Arquivo', () => {
  describe('Definição dos campos', () => {
    const header = sicoobCnab400.header!

    test('deve ter tipo_registro "0" (header) na posição 1', () => {
      expect(header.tipo_registro).toBeDefined()
      expect(header.tipo_registro.pos).toEqual([1, 1])
      expect(header.tipo_registro.type).toBe('num')
      expect(header.tipo_registro.size).toBe(1)
      expect(header.tipo_registro.pattern).toBe('0')
      expect(header.tipo_registro.required).toBe(true)
    })

    test('deve ter tipo_operacao "1" (remessa) na posição 2', () => {
      expect(header.tipo_operacao).toBeDefined()
      expect(header.tipo_operacao.pos).toEqual([2, 2])
      expect(header.tipo_operacao.type).toBe('num')
      expect(header.tipo_operacao.pattern).toBe('1')
      expect(header.tipo_operacao.required).toBe(true)
    })

    test('deve ter literal_remessa "REMESSA" na posição 3-9', () => {
      expect(header.literal_remessa).toBeDefined()
      expect(header.literal_remessa.pos).toEqual([3, 9])
      expect(header.literal_remessa.type).toBe('alfa')
      expect(header.literal_remessa.size).toBe(7)
      expect(header.literal_remessa.pattern).toBe('REMESSA')
      expect(header.literal_remessa.required).toBe(true)
    })

    test('deve ter codigo_servico na posição 10-11', () => {
      expect(header.codigo_servico).toBeDefined()
      expect(header.codigo_servico.pos).toEqual([10, 11])
      expect(header.codigo_servico.type).toBe('num')
      expect(header.codigo_servico.size).toBe(2)
      expect(header.codigo_servico.pattern).toBe('01')
      expect(header.codigo_servico.required).toBe(true)
    })

    test('deve ter literal_servico "COBRANCA" na posição 12-19', () => {
      expect(header.literal_servico).toBeDefined()
      expect(header.literal_servico.pos).toEqual([12, 19])
      expect(header.literal_servico.type).toBe('alfa')
      expect(header.literal_servico.size).toBe(8)
      expect(header.literal_servico.pattern).toBe('COBRANCA')
      expect(header.literal_servico.required).toBe(true)
    })

    test('deve ter brancos_1 na posição 20-26', () => {
      expect(header.brancos_1).toBeDefined()
      expect(header.brancos_1.pos).toEqual([20, 26])
      expect(header.brancos_1.type).toBe('alfa')
      expect(header.brancos_1.size).toBe(7)
      expect(header.brancos_1.required).toBe(false)
    })

    test('deve ter prefixo_cooperativa na posição 27-30 (4 dígitos)', () => {
      expect(header.prefixo_cooperativa).toBeDefined()
      expect(header.prefixo_cooperativa.pos).toEqual([27, 30])
      expect(header.prefixo_cooperativa.type).toBe('num')
      expect(header.prefixo_cooperativa.size).toBe(4)
      expect(header.prefixo_cooperativa.required).toBe(true)
    })

    test('deve ter dv_prefixo na posição 31', () => {
      expect(header.dv_prefixo).toBeDefined()
      expect(header.dv_prefixo.pos).toEqual([31, 31])
      expect(header.dv_prefixo.type).toBe('alfa')
      expect(header.dv_prefixo.size).toBe(1)
      expect(header.dv_prefixo.required).toBe(false)
    })

    test('deve ter codigo_cliente_beneficiario na posição 32-39 (8 dígitos)', () => {
      expect(header.codigo_cliente_beneficiario).toBeDefined()
      expect(header.codigo_cliente_beneficiario.pos).toEqual([32, 39])
      expect(header.codigo_cliente_beneficiario.type).toBe('num')
      expect(header.codigo_cliente_beneficiario.size).toBe(8)
      expect(header.codigo_cliente_beneficiario.required).toBe(true)
    })

    test('deve ter dv_codigo_cliente na posição 40', () => {
      expect(header.dv_codigo_cliente).toBeDefined()
      expect(header.dv_codigo_cliente.pos).toEqual([40, 40])
      expect(header.dv_codigo_cliente.type).toBe('alfa')
      expect(header.dv_codigo_cliente.size).toBe(1)
      expect(header.dv_codigo_cliente.required).toBe(true)
    })

    test('deve ter numero_convenio_lider na posição 41-46', () => {
      expect(header.numero_convenio_lider).toBeDefined()
      expect(header.numero_convenio_lider.pos).toEqual([41, 46])
      expect(header.numero_convenio_lider.type).toBe('alfa')
      expect(header.numero_convenio_lider.size).toBe(6)
      expect(header.numero_convenio_lider.required).toBe(false)
    })

    test('deve ter nome_beneficiario na posição 47-76', () => {
      expect(header.nome_beneficiario).toBeDefined()
      expect(header.nome_beneficiario.pos).toEqual([47, 76])
      expect(header.nome_beneficiario.type).toBe('alfa')
      expect(header.nome_beneficiario.size).toBe(30)
      expect(header.nome_beneficiario.required).toBe(true)
    })

    test('deve ter codigo_banco na posição 77-79 com padrão "756"', () => {
      expect(header.codigo_banco).toBeDefined()
      expect(header.codigo_banco.pos).toEqual([77, 79])
      expect(header.codigo_banco.type).toBe('num')
      expect(header.codigo_banco.size).toBe(3)
      expect(header.codigo_banco.pattern).toBe('756')
      expect(header.codigo_banco.required).toBe(true)
    })

    test('deve ter nome_banco na posição 80-94 com padrão "BANCOOBCED"', () => {
      expect(header.nome_banco).toBeDefined()
      expect(header.nome_banco.pos).toEqual([80, 94])
      expect(header.nome_banco.type).toBe('alfa')
      expect(header.nome_banco.size).toBe(15)
      expect(header.nome_banco.pattern).toBe('BANCOOBCED')
      expect(header.nome_banco.required).toBe(true)
    })

    test('deve ter data_gravacao na posição 95-100 com formato DDMMAA', () => {
      expect(header.data_gravacao).toBeDefined()
      expect(header.data_gravacao.pos).toEqual([95, 100])
      expect(header.data_gravacao.type).toBe('data')
      expect(header.data_gravacao.size).toBe(6)
      expect(header.data_gravacao.dateFormat).toBe('DDMMAA')
      expect(header.data_gravacao.required).toBe(true)
    })

    test('deve ter sequencial_remessa na posição 101-107', () => {
      expect(header.sequencial_remessa).toBeDefined()
      expect(header.sequencial_remessa.pos).toEqual([101, 107])
      expect(header.sequencial_remessa.type).toBe('num')
      expect(header.sequencial_remessa.size).toBe(7)
      expect(header.sequencial_remessa.required).toBe(false)
    })

    test('deve ter brancos_2 na posição 108-394 (filler grande)', () => {
      expect(header.brancos_2).toBeDefined()
      expect(header.brancos_2.pos).toEqual([108, 394])
      expect(header.brancos_2.type).toBe('alfa')
      expect(header.brancos_2.size).toBe(287)
      expect(header.brancos_2.required).toBe(false)
    })

    test('deve ter numero_sequencial na posição 395-400', () => {
      expect(header.numero_sequencial).toBeDefined()
      expect(header.numero_sequencial.pos).toEqual([395, 400])
      expect(header.numero_sequencial.type).toBe('num')
      expect(header.numero_sequencial.size).toBe(6)
      expect(header.numero_sequencial.pattern).toBe('000001')
      expect(header.numero_sequencial.required).toBe(true)
    })
  })

  describe('Características específicas', () => {
    const header = sicoobCnab400.header!

    test('deve ter 18 campos no total', () => {
      const campos = Object.keys(header)
      expect(campos.length).toBe(18)
    })

    test('prefixo_cooperativa deve ter descrição mencionando a planilha Contracapa', () => {
      expect(header.prefixo_cooperativa.description).toContain('Contracapa')
    })

    test('codigo_cliente_beneficiario deve ter descrição mencionando a planilha Contracapa', () => {
      expect(header.codigo_cliente_beneficiario.description).toContain('Contracapa')
    })

    test('campos obrigatórios devem incluir identificação e datas', () => {
      expect(header.tipo_registro.required).toBe(true)
      expect(header.tipo_operacao.required).toBe(true)
      expect(header.literal_remessa.required).toBe(true)
      expect(header.nome_beneficiario.required).toBe(true)
      expect(header.codigo_banco.required).toBe(true)
      expect(header.nome_banco.required).toBe(true)
      expect(header.data_gravacao.required).toBe(true)
      expect(header.numero_sequencial.required).toBe(true)
    })

    test('brancos_2 deve ser o maior campo do layout', () => {
      const campos = Object.keys(header)
      const tamanhos = campos.map((campo) => header[campo].size)
      const maiorTamanho = Math.max(...tamanhos)
      expect(header.brancos_2.size).toBe(maiorTamanho)
      expect(maiorTamanho).toBe(287)
    })
  })
})
