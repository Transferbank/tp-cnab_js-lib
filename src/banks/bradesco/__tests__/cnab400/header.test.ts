/**
 * Testes do Header de Arquivo - Bradesco CNAB 400
 * 
 * Valida a estrutura e campos do Header de Arquivo (tipo registro 0).
 * 
 * IMPORTANTE: Estes testes focam APENAS no PARSING do schema:
 * - Posi��es corretas dos campos
 * - Tipos de dados corretos
 * - Valores padr�o
 * - Campos obrigat�rios
 */

import * as fs from 'fs'
import * as path from 'path'
import { bradescoCnab400 } from '@banks/bradesco/schemas/cnab400'
import { extractLineFields } from '@parser/field-extractor'
import { readFixture } from './shared'

interface FixtureHeader {
  cedenteNome?: string
  dataGeracao?: string
  dataGeracaoRaw?: string
  tipoArquivo?: string
}

interface FixtureMetadata {
  header?: FixtureHeader
}

function loadLocalMetadata(): FixtureMetadata {
  const jsonPath = path.join(__dirname, '../../__fixtures__/cnab400/remessa-multipla.json')
  const jsonContent = fs.readFileSync(jsonPath, 'utf8')
  return JSON.parse(jsonContent)
}

describe('Schema Bradesco CNAB 400 - Header de Arquivo', () => {
  describe('Defini��o dos campos', () => {
    test('deve ter tipo de registro "0" (header) na posi��o 1', () => {
      const field = bradescoCnab400.header!.tipo_registro
      
      expect(field.pos).toEqual([1, 1])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('0')
      expect(field.required).toBe(true)
    })

    test('deve ter tipo de opera��o "1" (remessa) na posi��o 2', () => {
      const field = bradescoCnab400.header!.tipo_operacao
      
      expect(field.pos).toEqual([2, 2])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('1')
      expect(field.required).toBe(true)
    })

    test('deve ter literal "REMESSA" na posi��o 3-9', () => {
      const field = bradescoCnab400.header!.literal_remessa
      
      expect(field.pos).toEqual([3, 9])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('REMESSA')
      expect(field.required).toBe(true)
    })

    test('deve ter c�digo de servi�o "01" na posi��o 10-11', () => {
      const field = bradescoCnab400.header!.codigo_servico
      
      expect(field.pos).toEqual([10, 11])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('01')
      expect(field.required).toBe(true)
    })

    test('deve ter literal servi�o "COBRANCA" na posi��o 12-26', () => {
      const field = bradescoCnab400.header!.literal_servico
      
      expect(field.pos).toEqual([12, 26])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('COBRANCA')
      expect(field.required).toBe(true)
    })

    test('deve ter c�digo do cedente na posi��o 27-46', () => {
      const field = bradescoCnab400.header!.codigo_cedente
      
      expect(field.pos).toEqual([27, 46])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(20)
      expect(field.required).toBe(true)
    })

    test('deve ter nome da empresa na posi��o 47-76', () => {
      const field = bradescoCnab400.header!.nome_empresa
      
      expect(field.pos).toEqual([47, 76])
      expect(field.type).toBe('alfa')
      expect(field.size).toBe(30)
      expect(field.required).toBe(true)
    })

    test('deve ter c�digo do banco na posi��o 77-79 com padr�o "237"', () => {
      const field = bradescoCnab400.header!.codigo_banco
      
      expect(field.pos).toEqual([77, 79])
      expect(field.type).toBe('num')
      expect(field.pattern).toBe('237')
      expect(field.required).toBe(true)
    })

    test('deve ter nome do banco na posi��o 80-94', () => {
      const field = bradescoCnab400.header!.nome_banco
      
      expect(field.pos).toEqual([80, 94])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('BRADESCO')
      expect(field.required).toBe(false)
    })

    test('deve ter data de gera��o na posi��o 95-100 com formato DDMMAA', () => {
      const field = bradescoCnab400.header!.data_geracao
      
      expect(field.pos).toEqual([95, 100])
      expect(field.type).toBe('data')
      expect(field.dateFormat).toBe('DDMMAA')
      expect(field.required).toBe(true)
    })

    test('deve ter identifica��o do sistema "MX" na posi��o 109-110', () => {
      const field = bradescoCnab400.header!.identificacao_sistema
      
      expect(field.pos).toEqual([109, 110])
      expect(field.type).toBe('alfa')
      expect(field.pattern).toBe('MX')
      expect(field.required).toBe(true)
    })

    test('deve ter n�mero sequencial de remessa na posi��o 111-117', () => {
      const field = bradescoCnab400.header!.sequencial_remessa
      
      expect(field.pos).toEqual([111, 117])
      expect(field.type).toBe('num')
      expect(field.size).toBe(7)
      expect(field.required).toBe(true)
    })

    test('deve ter n�mero sequencial na posi��o 395-400', () => {
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

    test('deve extrair c�digo do banco "237"', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      expect(header.codigo_banco.raw).toBe('237')
      expect(header.codigo_banco.value).toBe(237)
      expect(header.codigo_banco.error).toBeFalsy()
    })

    test('deve extrair tipo de opera��o "1" (remessa)', () => {
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

    test('deve extrair c�digo de servi�o "01"', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      expect(header.codigo_servico.raw).toBe('01')
      expect(header.codigo_servico.value).toBe(1)
      expect(header.codigo_servico.error).toBeFalsy()
    })

    test('deve extrair literal servi�o "COBRANCA" (posi��o 12-26)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      // Campo padr�o FEBRABAN: sempre "COBRANCA" para arquivo de cobran�a
      const valor = typeof header.literal_servico.value === 'string' 
        ? header.literal_servico.value.trim() 
        : String(header.literal_servico.value)
      expect(valor).toBe('COBRANCA')
      expect(header.literal_servico.error).toBeFalsy()
    })

    test('deve extrair nome do banco "BRADESCO" (posi��o 80-94)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      // Campo padr�o FEBRABAN: sempre "BRADESCO" para banco 237
      const valor = typeof header.nome_banco.value === 'string'
        ? header.nome_banco.value.trim()
        : String(header.nome_banco.value)
      expect(valor).toBe('BRADESCO')
      expect(header.nome_banco.error).toBeFalsy()
    })

    test('numero_sequencial deve ser sempre 1 no header (evid�ncia estrutural)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      // Header � sempre a primeira linha do arquivo, portanto numero_sequencial deve ser 1
      expect(header.numero_sequencial.value).toBe(1)
      expect(header.numero_sequencial.error).toBeFalsy()
    })

    test('deve extrair nome da empresa (do JSON)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      const metadata = loadLocalMetadata()
      
      if (metadata.header?.cedenteNome) {
        expect(header.nome_empresa.value).toMatch(new RegExp(metadata.header.cedenteNome))
      }
      expect(header.nome_empresa.error).toBeFalsy()
    })

    test('deve extrair data de geração (do JSON)', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      const metadata = loadLocalMetadata()
      
      if (metadata.header?.dataGeracaoRaw) {
        expect(header.data_geracao.raw).toBe(metadata.header.dataGeracaoRaw)
      }
      expect(header.data_geracao.error).toBeFalsy()
    })

    test('deve extrair identifica��o do sistema "MX"', () => {
      const header = extractLineFields(lines[0], bradescoCnab400.header!)
      
      expect(header.identificacao_sistema.value).toBe('MX')
      expect(header.identificacao_sistema.error).toBeFalsy()
    })
  })
})
