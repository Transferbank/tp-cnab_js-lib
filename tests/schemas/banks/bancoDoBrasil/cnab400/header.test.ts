/**
 * Testes do Schema Banco do Brasil CNAB 400 - Header de Arquivo
 *
 * Parte 1: Definição dos campos (sem fixture)
 * Parte 2: Parsing de arquivo real
 */

import { bancoDoBrasilCnab400 } from '../../../../../src/banks/bancoDoBrasil/schemas/cnab400'
import { extractLineFields } from '../../../../../src/parser/field-extractor'
import * as fs from 'fs'
import * as path from 'path'

function readFixture(filename: string): string[] {
  const fixturePath = path.join(__dirname, '../../../../fixtures/cnab400/bancodobrasil', filename)
  const content = fs.readFileSync(fixturePath, 'latin1')
  return content.split(/\r?\n/).filter((line) => line.trim().length > 0)
}

describe('Schema Banco do Brasil CNAB 400 - Header de Arquivo', () => {
  describe('Definição dos campos', () => {
    const header = bancoDoBrasilCnab400.header!

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

    test('deve ter código de serviço "01" na posição 10-11', () => {
      expect(header.codigo_servico).toBeDefined()
      expect(header.codigo_servico.pos).toEqual([10, 11])
      expect(header.codigo_servico.type).toBe('num')
      expect(header.codigo_servico.size).toBe(2)
      expect(header.codigo_servico.pattern).toBe('01')
    })

    test('deve ter literal serviço "COBRANCA" na posição 12-26', () => {
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
      expect(header.agencia.required).toBe(true)
    })

    test('deve ter dígito da agência na posição 31', () => {
      expect(header.agencia_dv).toBeDefined()
      expect(header.agencia_dv.pos).toEqual([31, 31])
      expect(header.agencia_dv.type).toBe('alfa')
      expect(header.agencia_dv.size).toBe(1)
    })

    test('deve ter conta na posição 32-39', () => {
      expect(header.conta).toBeDefined()
      expect(header.conta.pos).toEqual([32, 39])
      expect(header.conta.type).toBe('num')
      expect(header.conta.size).toBe(8)
      expect(header.conta.required).toBe(true)
    })

    test('deve ter dígito da conta na posição 40', () => {
      expect(header.conta_dv).toBeDefined()
      expect(header.conta_dv.pos).toEqual([40, 40])
      expect(header.conta_dv.type).toBe('alfa')
      expect(header.conta_dv.size).toBe(1)
    })

    test('deve ter zeros na posição 41-46', () => {
      expect(header.zeros).toBeDefined()
      expect(header.zeros.pos).toEqual([41, 46])
      expect(header.zeros.type).toBe('num')
      expect(header.zeros.size).toBe(6)
      expect(header.zeros.pattern).toBe('000000')
    })

    test('deve ter nome da empresa na posição 47-76', () => {
      expect(header.nome_empresa).toBeDefined()
      expect(header.nome_empresa.pos).toEqual([47, 76])
      expect(header.nome_empresa.type).toBe('alfa')
      expect(header.nome_empresa.size).toBe(30)
      expect(header.nome_empresa.required).toBe(true)
    })

    test('deve ter código do banco na posição 77-79 com padrão "001"', () => {
      expect(header.codigo_banco).toBeDefined()
      expect(header.codigo_banco.pos).toEqual([77, 79])
      expect(header.codigo_banco.type).toBe('num')
      expect(header.codigo_banco.size).toBe(3)
      expect(header.codigo_banco.pattern).toBe('001')
    })

    test('deve ter nome do banco na posição 80-94', () => {
      expect(header.nome_banco).toBeDefined()
      expect(header.nome_banco.pos).toEqual([80, 94])
      expect(header.nome_banco.type).toBe('alfa')
      expect(header.nome_banco.size).toBe(15)
      expect(header.nome_banco.pattern).toBe('BANCODOBRASIL')
    })

    test('deve ter data de geração na posição 95-100 com formato DDMMAA', () => {
      expect(header.data_geracao).toBeDefined()
      expect(header.data_geracao.pos).toEqual([95, 100])
      expect(header.data_geracao.type).toBe('data')
      expect(header.data_geracao.size).toBe(6)
      expect(header.data_geracao.dateFormat).toBe('DDMMAA')
    })

    test('deve ter sequencial da remessa na posição 101-107', () => {
      expect(header.sequencial_remessa).toBeDefined()
      expect(header.sequencial_remessa.pos).toEqual([101, 107])
      expect(header.sequencial_remessa.type).toBe('num')
      expect(header.sequencial_remessa.size).toBe(7)
    })

    test('deve ter convênio líder na posição 130-136', () => {
      expect(header.convenio_lider).toBeDefined()
      expect(header.convenio_lider.pos).toEqual([130, 136])
      expect(header.convenio_lider.type).toBe('num')
      expect(header.convenio_lider.size).toBe(7)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      expect(header.numero_sequencial).toBeDefined()
      expect(header.numero_sequencial.pos).toEqual([395, 400])
      expect(header.numero_sequencial.type).toBe('num')
      expect(header.numero_sequencial.size).toBe(6)
      expect(header.numero_sequencial.pattern).toBe('000001')
    })
  })

  describe('Parsing de arquivo real', () => {
    const lines = readFixture('BANCOBRASIL_cnab_400.REM')
    const headerLine = lines[0]
    const headerFields = extractLineFields(headerLine, bancoDoBrasilCnab400.header!)

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

    test('deve extrair agência do cedente', () => {
      expect(headerFields.agencia.raw).toBeDefined()
      expect(headerFields.agencia.raw).toBe('4321')
    })

    test('deve extrair dígito da agência', () => {
      expect(headerFields.agencia_dv.raw).toBeDefined()
      // No arquivo real pode ser branco ou dígito
    })

    test('deve extrair conta do cedente', () => {
      expect(headerFields.conta.raw).toBeDefined()
      expect(headerFields.conta.raw).toBe('00012345')
    })

    test('deve extrair dígito da conta', () => {
      expect(headerFields.conta_dv.raw).toBeDefined()
      expect(headerFields.conta_dv.raw).toBe('7')
    })

    test('deve extrair nome da empresa', () => {
      expect(headerFields.nome_empresa.value).toBeDefined()
      expect(String(headerFields.nome_empresa.value).trim().length).toBeGreaterThan(0)
      // Valor confirmado no arquivo (fixture com dados fictícios)
      expect(String(headerFields.nome_empresa.value).trim()).toBe('EMPRESA EXEMPLO IMPORT LTDA')
    })

    test('deve extrair código do banco "001"', () => {
      expect(headerFields.codigo_banco.raw).toBe('001')
    })

    test('deve extrair nome do banco "BANCODOBRASIL"', () => {
      expect(String(headerFields.nome_banco.value).trim()).toBe('BANCODOBRASIL')
    })

    test('deve extrair data de geração no formato DDMMAA', () => {
      expect(headerFields.data_geracao.raw).toBeDefined()
      expect(headerFields.data_geracao.raw.length).toBe(6)
      // Valor confirmado: 260526 (26/05/26)
      expect(headerFields.data_geracao.raw).toBe('260526')
    })

    test('deve extrair sequencial da remessa', () => {
      expect(headerFields.sequencial_remessa.raw).toBeDefined()
      expect(headerFields.sequencial_remessa.raw).toBe('0000241')
    })

    test('deve extrair convênio líder', () => {
      expect(headerFields.convenio_lider.raw).toBeDefined()
      expect(headerFields.convenio_lider.raw).toBe('9007654')
    })

    test('numero_sequencial deve ser sempre 1 no header (evidência estrutural)', () => {
      expect(headerFields.numero_sequencial.value).toBe(1)
    })
  })
})
