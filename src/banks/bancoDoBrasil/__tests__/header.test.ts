/**
 * Testes do Schema Banco do Brasil CNAB 400 - Header de Arquivo
 *
 * Parte 1: Definição dos campos (sem fixture)
 * Parte 2: Parsing de arquivo real
 */

import { bancoDoBrasilCnab400 } from '@banks/bancoDoBrasil/schemas/cnab400'
import { extractLineFields } from '@parser/field-extractor'
import * as fs from 'fs'
import * as path from 'path'

function readFixture(filename: string): string[] {
  const fixturePath = path.join(__dirname, '../__fixtures__', filename)
  const content = fs.readFileSync(fixturePath, 'latin1')
  return content.split(/\r?\n/).filter((line) => line.trim().length > 0)
}

describe('Schema Banco do Brasil CNAB 400 - Header de Arquivo', () => {
  describe('Definição dos campos', () => {
    const header = bancoDoBrasilCnab400.header!

    test('deve ter dígito da agência na posição 31', () => {
      expect(header.agencia_dv).toBeDefined()
      expect(header.agencia_dv.pos).toEqual([31, 31])
      expect(header.agencia_dv.type).toBe('alfa')
      expect(header.agencia_dv.size).toBe(1)
    })

    test('deve ter zeros na posição 41-46', () => {
      expect(header.zeros).toBeDefined()
      expect(header.zeros.pos).toEqual([41, 46])
      expect(header.zeros.type).toBe('num')
      expect(header.zeros.size).toBe(6)
      expect(header.zeros.pattern).toBe('000000')
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

