/**
 * Testes do Header de Arquivo - Bradesco CNAB 400
 * 
 * Valida a estrutura e campos do Header de Arquivo (tipo registro 0).
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posições corretas dos campos
 * - Tipos de dados corretos
 * - Valores padrão
 * - Campos obrigatórios
 */

import { bradescoCnab400 } from '../../../../../src/banks/bradesco/schemas/cnab400'
import { extractLineFields } from '../../../../../src/parser/field-extractor'
import { loadFixtureMetadata } from '../../../../helpers/fixture-metadata'
import { readFixture } from './shared'

describe('Schema Bradesco CNAB 400 - Header de Arquivo', () => {
  describe('Definição dos campos', () => {
    test('deve ter tipo de registro "0" (header) na posição 1', () => {
      const field = bradescoCnab400.header!.tipo_registro
      
      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('0')
      expect(field.required).toBe(true)
    })

    test('deve ter tipo de operação "1" (remessa) na posição 2', () => {
      const field = bradescoCnab400.header!.tipo_operacao
      
      expect(field.pos).toEqual([2, 2])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('1')
      expect(field.required).toBe(true)
    })

    test('deve ter literal "REMESSA" na posição 3-9', () => {
      const field = bradescoCnab400.header!.literal_remessa
      
      expect(field.pos).toEqual([3, 9])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('REMESSA')
      expect(field.required).toBe(true)
    })

    test('deve ter código de serviço "01" na posição 10-11', () => {
      const field = bradescoCnab400.header!.codigo_servico
      
      expect(field.pos).toEqual([10, 11])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('01')
      expect(field.required).toBe(true)
    })

    test('deve ter literal serviço "COBRANCA" na posição 12-26', () => {
      const field = bradescoCnab400.header!.literal_servico
      
      expect(field.pos).toEqual([12, 26])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('COBRANCA')
      expect(field.required).toBe(true)
    })

    test('deve ter código do cedente na posição 27-46', () => {
      const field = bradescoCnab400.header!.codigo_cedente
      
      expect(field.pos).toEqual([27, 46])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(20)
      expect(field.required).toBe(true)
    })

    test('deve ter nome da empresa na posição 47-76', () => {
      const field = bradescoCnab400.header!.nome_empresa
      
      expect(field.pos).toEqual([47, 76])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(30)
      expect(field.required).toBe(true)
    })

    test('deve ter código do banco na posição 77-79 com padrão "237"', () => {
      const field = bradescoCnab400.header!.codigo_banco
      
      expect(field.pos).toEqual([77, 79])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('237')
      expect(field.required).toBe(true)
    })

    test('deve ter nome do banco na posição 80-94', () => {
      const field = bradescoCnab400.header!.nome_banco
      
      expect(field.pos).toEqual([80, 94])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('BRADESCO')
      expect(field.required).toBe(false)
    })

    test('deve ter data de geração na posição 95-100 com formato DDMMAA', () => {
      const field = bradescoCnab400.header!.data_geracao
      
      expect(field.pos).toEqual([95, 100])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(true)
    })

    test('deve ter identificação do sistema "MX" na posição 109-110', () => {
      const field = bradescoCnab400.header!.identificacao_sistema
      
      expect(field.pos).toEqual([109, 110])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('MX')
      expect(field.required).toBe(true)
    })

    test('deve ter número sequencial de remessa na posição 111-117', () => {
      const field = bradescoCnab400.header!.sequencial_remessa
      
      expect(field.pos).toEqual([111, 117])
      expect(field.type).toBe('num')
      expect(field.size).toBe(7)
      expect(field.required).toBe(true)
    })

    test('deve ter número sequencial na posição 395-400', () => {
      const field = bradescoCnab400.header!.numero_sequencial
      
      expect(field.pos).toEqual([395, 400])
      expect(field.type).toBe('num')
      expect(field.size).toBe(6)
      expect(field.pattern).toBe('000001')
      expect(field.required).toBe(true)
    })
  })

  describe('Parsing de arquivo real', () => {
    let lines: string[]

    beforeAll(() => {
      lines = readFixture('remessa-multipla.txt')
    })

    test('deve extrair tipo de registro "0" (header)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      expect(header.tipo_registro.raw).toBe('0')
      expect(header.tipo_registro.value).toBe(0)
      expect(header.tipo_registro.error).toBeFalsy()
    })

    test('deve extrair código do banco "237"', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      expect(header.codigo_banco.raw).toBe('237')
      expect(header.codigo_banco.value).toBe(237)
      expect(header.codigo_banco.error).toBeFalsy()
    })

    test('deve extrair tipo de operação "1" (remessa)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      expect(header.tipo_operacao.raw).toBe('1')
      expect(header.tipo_operacao.value).toBe(1)
      expect(header.tipo_operacao.error).toBeFalsy()
    })

    test('deve extrair literal "REMESSA"', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      expect(header.literal_remessa.value).toBe('REMESSA')
      expect(header.literal_remessa.error).toBeFalsy()
    })

    test('deve extrair código de serviço "01"', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      expect(header.codigo_servico.raw).toBe('01')
      expect(header.codigo_servico.value).toBe(1)
      expect(header.codigo_servico.error).toBeFalsy()
    })

    test('deve extrair literal serviço "COBRANCA" (posição 12-26)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      // Campo padrão FEBRABAN: sempre "COBRANCA" para arquivo de cobrança
      const valor = typeof header.literal_servico.value === 'string' 
        ? header.literal_servico.value.trim() 
        : String(header.literal_servico.value)
      expect(valor).toBe('COBRANCA')
      expect(header.literal_servico.error).toBeFalsy()
    })

    test('deve extrair nome do banco "BRADESCO" (posição 80-94)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      // Campo padrão FEBRABAN: sempre "BRADESCO" para banco 237
      const valor = typeof header.nome_banco.value === 'string'
        ? header.nome_banco.value.trim()
        : String(header.nome_banco.value)
      expect(valor).toBe('BRADESCO')
      expect(header.nome_banco.error).toBeFalsy()
    })

    test('numero_sequencial deve ser sempre 1 no header (evidência estrutural)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      // Header é sempre a primeira linha do arquivo, portanto numero_sequencial deve ser 1
      expect(header.numero_sequencial.value).toBe(1)
      expect(header.numero_sequencial.error).toBeFalsy()
    })

    test('deve extrair nome da empresa (do JSON)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla', 'cnab400')
      
      if (metadata.header?.cedenteNome) {
        expect(header.nome_empresa.value).toMatch(new RegExp(metadata.header.cedenteNome))
      }
      expect(header.nome_empresa.error).toBeFalsy()
    })

    test('deve extrair data de geração (do JSON)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla', 'cnab400')
      
      if (metadata.header?.dataGeracaoRaw) {
        expect(header.data_geracao.raw).toBe(metadata.header.dataGeracaoRaw)
      }
      expect(header.data_geracao.error).toBeFalsy()
    })

    test('deve extrair identificação do sistema "MX"', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      expect(header.identificacao_sistema.value).toBe('MX')
      expect(header.identificacao_sistema.error).toBeFalsy()
    })
  })
})
