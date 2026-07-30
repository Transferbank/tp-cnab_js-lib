/**
 * Testes do Schema Sicredi CNAB 400 - Header de Arquivo
 *
 * Verifica a definição do schema do header conforme o manual oficial Sicredi
 * (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.1, p.25
 */

import { HEADER } from '@banks/sicredi/schemas/cnab400/header'

describe('Schema Sicredi CNAB 400 - Header de Arquivo', () => {
  describe('Definição dos campos', () => {
    test('deve ter tipo de registro "0" (header) na posição 1', () => {
      expect(HEADER.tipo_registro).toBeDefined()
      expect(HEADER.tipo_registro.pos).toEqual([1, 1])
      expect(HEADER.tipo_registro.type).toBe('num')
      expect(HEADER.tipo_registro.size).toBe(1)
      expect(HEADER.tipo_registro.pattern).toBe('0')
      expect(HEADER.tipo_registro.required).toBe(true)
    })

    test('deve ter tipo de operação "1" (remessa) na posição 2', () => {
      expect(HEADER.tipo_operacao).toBeDefined()
      expect(HEADER.tipo_operacao.pos).toEqual([2, 2])
      expect(HEADER.tipo_operacao.type).toBe('num')
      expect(HEADER.tipo_operacao.size).toBe(1)
      expect(HEADER.tipo_operacao.pattern).toBe('1')
      expect(HEADER.tipo_operacao.required).toBe(true)
    })

    test('deve ter literal "REMESSA" na posição 3-9', () => {
      expect(HEADER.literal_remessa).toBeDefined()
      expect(HEADER.literal_remessa.pos).toEqual([3, 9])
      expect(HEADER.literal_remessa.type).toBe('alfa')
      expect(HEADER.literal_remessa.size).toBe(7)
      expect(HEADER.literal_remessa.pattern).toBe('REMESSA')
      expect(HEADER.literal_remessa.required).toBe(true)
    })

    test('deve ter código de serviço "01" na posição 10-11', () => {
      expect(HEADER.codigo_servico).toBeDefined()
      expect(HEADER.codigo_servico.pos).toEqual([10, 11])
      expect(HEADER.codigo_servico.type).toBe('num')
      expect(HEADER.codigo_servico.size).toBe(2)
      expect(HEADER.codigo_servico.pattern).toBe('01')
      expect(HEADER.codigo_servico.required).toBe(true)
    })

    test('deve ter literal serviço "COBRANCA" na posição 12-26', () => {
      expect(HEADER.literal_servico).toBeDefined()
      expect(HEADER.literal_servico.pos).toEqual([12, 26])
      expect(HEADER.literal_servico.type).toBe('alfa')
      expect(HEADER.literal_servico.size).toBe(15)
      expect(HEADER.literal_servico.pattern).toBe('COBRANCA')
    })

    test('deve ter código do cliente na posição 27-31', () => {
      expect(HEADER.codigo_cliente).toBeDefined()
      expect(HEADER.codigo_cliente.pos).toEqual([27, 31])
      expect(HEADER.codigo_cliente.type).toBe('num')
      expect(HEADER.codigo_cliente.size).toBe(5)
      expect(HEADER.codigo_cliente.required).toBe(true)
    })

    test('deve ter número de inscrição do cedente na posição 32-45', () => {
      expect(HEADER.numero_inscricao_cedente).toBeDefined()
      expect(HEADER.numero_inscricao_cedente.pos).toEqual([32, 45])
      expect(HEADER.numero_inscricao_cedente.type).toBe('num')
      expect(HEADER.numero_inscricao_cedente.size).toBe(14)
      expect(HEADER.numero_inscricao_cedente.required).toBe(true)
    })

    test('deve ter código do banco na posição 77-79 com padrão "748"', () => {
      expect(HEADER.codigo_banco).toBeDefined()
      expect(HEADER.codigo_banco.pos).toEqual([77, 79])
      expect(HEADER.codigo_banco.type).toBe('num')
      expect(HEADER.codigo_banco.size).toBe(3)
      expect(HEADER.codigo_banco.pattern).toBe('748')
      expect(HEADER.codigo_banco.required).toBe(true)
    })

    test('deve ter nome do banco na posição 80-94', () => {
      expect(HEADER.nome_banco).toBeDefined()
      expect(HEADER.nome_banco.pos).toEqual([80, 94])
      expect(HEADER.nome_banco.type).toBe('alfa')
      expect(HEADER.nome_banco.size).toBe(15)
      expect(HEADER.nome_banco.pattern).toBe('SICREDI')
    })

    test('deve ter data de geração na posição 95-102 com formato AAAAMMDD', () => {
      expect(HEADER.data_geracao).toBeDefined()
      expect(HEADER.data_geracao.pos).toEqual([95, 102])
      expect(HEADER.data_geracao.type).toBe('data')
      expect(HEADER.data_geracao.size).toBe(8)
      expect(HEADER.data_geracao.dateFormat).toBe('AAAAMMDD')
      expect(HEADER.data_geracao.required).toBe(true)
    })

    test('deve ter sequencial da remessa na posição 111-117', () => {
      expect(HEADER.sequencial_remessa).toBeDefined()
      expect(HEADER.sequencial_remessa.pos).toEqual([111, 117])
      expect(HEADER.sequencial_remessa.type).toBe('num')
      expect(HEADER.sequencial_remessa.size).toBe(7)
      expect(HEADER.sequencial_remessa.required).toBe(true)
    })

    test('deve ter versão do sistema na posição 391-394', () => {
      expect(HEADER.versao_sistema).toBeDefined()
      expect(HEADER.versao_sistema.pos).toEqual([391, 394])
      expect(HEADER.versao_sistema.type).toBe('alfa')
      expect(HEADER.versao_sistema.size).toBe(4)
      expect(HEADER.versao_sistema.pattern).toBe('2.00')
      expect(HEADER.versao_sistema.required).toBe(true)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(HEADER.numero_sequencial).toBeDefined()
      expect(HEADER.numero_sequencial.pos).toEqual([395, 400])
      expect(HEADER.numero_sequencial.type).toBe('num')
      expect(HEADER.numero_sequencial.size).toBe(6)
      expect(HEADER.numero_sequencial.pattern).toBe('000001')
      expect(HEADER.numero_sequencial.required).toBe(true)
    })
  })

  describe('Particularidades do Sicredi', () => {
    test('deve usar código do cliente (5 dígitos) em vez de agência+conta separados', () => {
      expect(HEADER.codigo_cliente).toBeDefined()
      expect(HEADER.codigo_cliente.size).toBe(5)
      expect(HEADER.agencia).toBeUndefined()
      expect(HEADER.conta).toBeUndefined()
    })

    test('data de geração deve usar formato AAAAMMDD (8 dígitos), não DDMMAA', () => {
      expect(HEADER.data_geracao.dateFormat).toBe('AAAAMMDD')
      expect(HEADER.data_geracao.size).toBe(8)
    })

    test('deve ter campo versão do sistema (não presente em outros bancos)', () => {
      expect(HEADER.versao_sistema).toBeDefined()
      expect(HEADER.versao_sistema.pattern).toBe('2.00')
    })
  })
})

