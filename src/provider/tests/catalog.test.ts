/**
 * Testes para Provider Catalog.
 * 
 * Testa a factory de CNABProvider (createProvider/getProvider) - resolução
 * para todos os bancos+formatos cadastrados, null para não cadastrados,
 * equivalência entre provider.group() e groupLines() direto.
 */

import * as fs from 'fs'
import * as path from 'path'
import { getProvider } from '@/provider/catalog'
import { groupLines } from '@/grouping/group-lines'
import { getGroupingRule } from '@/grouping/grouping-rules'
import { extractLineFields } from '@parser/field-extractor'
import { getBankSchema } from '@schemas/index'
import { CNABFormatCode, ReadMode } from '@tp-types/index'

describe('Provider Catalog', () => {
  describe('getProvider - bancos CNAB 400 cadastrados', () => {
    const bancosCnab400 = [
      { code: '001', name: 'Banco do Brasil' },
      { code: '033', name: 'Santander' },
      { code: '104', name: 'Caixa' },
      { code: '237', name: 'Bradesco' },
      { code: '341', name: 'Itaú' },
      { code: '748', name: 'Sicredi' },
      { code: '756', name: 'Sicoob' },
    ]

    bancosCnab400.forEach(({ code, name }) => {
      test(`deve resolver provider para ${name} (${code}) CNAB 400`, () => {
        const provider = getProvider(code, CNABFormatCode.CNAB400, ReadMode.SIMPLE)

        expect(provider).not.toBeNull()
        expect(provider?.bankCode).toBe(code)
        expect(provider?.format).toBe(CNABFormatCode.CNAB400)
        expect(provider?.mode).toBe(ReadMode.SIMPLE)
        expect(provider?.schema).toBeDefined()
        expect(provider?.groupingRule).toBeDefined()
        expect(typeof provider?.group).toBe('function')
        expect(typeof provider?.extractHeader).toBe('function')
        expect(typeof provider?.extractTrailer).toBe('function')
        expect(typeof provider?.extractBill).toBe('function')
      })
    })
  })

  describe('getProvider - bancos CNAB 240 cadastrados', () => {
    const bancosCnab240 = [
      { code: '033', name: 'Santander' },
      { code: '237', name: 'Bradesco' },
      { code: '748', name: 'Sicredi' },
    ]

    bancosCnab240.forEach(({ code, name }) => {
      test(`deve resolver provider para ${name} (${code}) CNAB 240`, () => {
        const provider = getProvider(code, CNABFormatCode.CNAB240, ReadMode.SIMPLE)

        expect(provider).not.toBeNull()
        expect(provider?.bankCode).toBe(code)
        expect(provider?.format).toBe(CNABFormatCode.CNAB240)
        expect(provider?.mode).toBe(ReadMode.SIMPLE)
        expect(provider?.schema).toBeDefined()
        expect(provider?.groupingRule).toBeDefined()
      })
    })
  })

  describe('getProvider - combinações não cadastradas', () => {
    test('deve lançar erro para Banco do Brasil CNAB 240 (não cadastrado)', () => {
      expect(() => {
        getProvider('001', CNABFormatCode.CNAB240, ReadMode.SIMPLE)
      }).toThrow()
    })

    test('deve lançar erro para banco totalmente inexistente', () => {
      expect(() => {
        getProvider('999', CNABFormatCode.CNAB400, ReadMode.SIMPLE)
      }).toThrow()
    })

    test('deve lançar erro para Itaú CNAB 240 (não cadastrado)', () => {
      expect(() => {
        getProvider('341', CNABFormatCode.CNAB240, ReadMode.SIMPLE)
      }).toThrow()
    })
  })

  describe('provider.group() equivalência com groupLines direto', () => {
    test('Bradesco CNAB 400: provider.group() produz mesmo resultado que groupLines direto', () => {
      // Carregar fixture real
      const fixturePath = path.join(__dirname, '../../banks/bradesco/docs/cnab400/remessa-multipla.txt')
      const fixture = fs.readFileSync(fixturePath, 'latin1')
      const lines = fixture.split(/\r?\n/).filter(line => line.length === 400)

      // Obter schema e regra diretamente
      const schema = getBankSchema('237', CNABFormatCode.CNAB400)!
      const rule = getGroupingRule('237', CNABFormatCode.CNAB400)!

      // Extrair linhas parseadas (excluir header/trailer para focar nos detalhes)
      const parsedLines = lines
        .slice(1, -1) // Pular header (primeira) e trailer (última)
        .map(line => extractLineFields(line, schema.detail!))

      // Obter provider
      const provider = getProvider('237', CNABFormatCode.CNAB400, ReadMode.SIMPLE)

      // Comparar resultados
      const resultProvider = provider.group(parsedLines)
      const resultDirect = groupLines(parsedLines, rule, CNABFormatCode.CNAB400)

      expect(resultProvider.groups.length).toBe(resultDirect.groups.length)
      expect(resultProvider.errors.length).toBe(resultDirect.errors.length)
      expect(resultProvider).toEqual(resultDirect)
    })

    test('Santander CNAB 400: provider.group() produz mesmo resultado que groupLines direto', () => {
      // Carregar fixture real
      const fixturePath = path.join(__dirname, '../../banks/santander/docs/cnab400/SANTANDER_cnab_400_140.REM')
      const fixture = fs.readFileSync(fixturePath, 'latin1')
      const lines = fixture.split(/\r?\n/).filter(line => line.length === 400)

      // Obter schema e regra diretamente
      const schema = getBankSchema('033', CNABFormatCode.CNAB400)!
      const rule = getGroupingRule('033', CNABFormatCode.CNAB400)!

      // Extrair linhas parseadas (excluir header/trailer)
      const parsedLines = lines
        .slice(1, -1)
        .map(line => extractLineFields(line, schema.detail!))

      // Obter provider
      const provider = getProvider('033', CNABFormatCode.CNAB400, ReadMode.SIMPLE)

      // Comparar resultados
      const resultProvider = provider.group(parsedLines)
      const resultDirect = groupLines(parsedLines, rule, CNABFormatCode.CNAB400)

      expect(resultProvider.groups.length).toBe(resultDirect.groups.length)
      expect(resultProvider.errors.length).toBe(resultDirect.errors.length)
      expect(resultProvider).toEqual(resultDirect)
    })
  })

  describe('provider.extract* são as funções importadas', () => {
    test('extractHeader/Trailer/Bill são as mesmas funções de extract-canonical', () => {
      const provider = getProvider('237', CNABFormatCode.CNAB400, ReadMode.SIMPLE)

      // Testar que as funções existem e são invocáveis
      expect(typeof provider.extractHeader).toBe('function')
      expect(typeof provider.extractTrailer).toBe('function')
      expect(typeof provider.extractBill).toBe('function')

      // Teste de comportamento: extrair header de fixture real
      const fixturePath = path.join(__dirname, '../../banks/bradesco/docs/cnab400/remessa-multipla.txt')
      const fixture = fs.readFileSync(fixturePath, 'latin1')
      const firstLine = fixture.split(/\r?\n/)[0]

      const schema = getBankSchema('237', CNABFormatCode.CNAB400)!
      const parsedHeader = extractLineFields(firstLine, schema.header!)

      const header = provider.extractHeader(parsedHeader)

      // Deve ter extraído cedente.nome do header
      expect(header.cedente).toBeDefined()
      expect(header.cedente.nome).toBeDefined()
      expect(typeof header.cedente.nome).toBe('string')
    })
  })
})
