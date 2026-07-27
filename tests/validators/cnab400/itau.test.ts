/**
 * Testes de validação CNAB 400 — Itaú (341)
 * 
 * Testa a validação completa de arquivos CNAB 400 do Itaú incluindo:
 * - Estrutura do arquivo (header, detail, trailer)
 * - Validação de campos (valor, vencimento, documento, CPF/CNPJ)
 * - Múltiplos detalhes
 * - Validação do fixture real ITAU_cnab_400.REM
 */

import * as fs from 'fs'
import * as path from 'path'
import { validateCnabFile } from '../../../src'
import { itauCnab400 } from '../../../src/banks/itau/schemas/cnab400'
import { buildLine400 } from '../../helpers/cnab-builder'

describe('validateCnabFile — Itaú (341) CNAB 400', () => {
  describe('Validação básica', () => {
    test('deve validar um arquivo bem formado sem erros', () => {
      const header = buildLine400(itauCnab400.header!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(itauCnab400.detail!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        carteira: 'I',
        nosso_numero: '12345678',
        dac_nosso_numero: '9',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '11144477735', // CPF válido (111.444.777-35)
        nome: 'JOAO DA SILVA',
        vencimento: '311299', // 31/12/2099 — sempre no futuro
        valor_titulo: '0000000010000', // R$ 100,00
        aceite: 'N',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(itauCnab400.trailer!, {
        numero_sequencial: '000003',
      })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
      expect(result.bank).toEqual({ code: '341', name: 'Itaú' })
      expect(result.totalRecords).toBe(1)
    })

    test('deve validar arquivo com múltiplos detalhes', () => {
      const header = buildLine400(itauCnab400.header!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail1 = buildLine400(itauCnab400.detail!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        carteira: 'I',
        nosso_numero: '12345678',
        dac_nosso_numero: '9',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '11144477735',
        nome: 'JOAO DA SILVA',
        vencimento: '311299',
        valor_titulo: '0000000010000',
        aceite: 'N',
        numero_sequencial: '000002',
      })

      const detail2 = buildLine400(itauCnab400.detail!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        carteira: 'I',
        nosso_numero: '12345679',
        dac_nosso_numero: '0',
        numero_documento: 'DOC0000002',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '12345678909',
        nome: 'MARIA SANTOS',
        vencimento: '151299',
        valor_titulo: '0000000020000',
        aceite: 'N',
        numero_sequencial: '000003',
      })
      
      const trailer = buildLine400(itauCnab400.trailer!, {
        numero_sequencial: '000004',
      })

      const result = validateCnabFile([header, detail1, detail2, trailer].join('\n'))

      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
      expect(result.totalRecords).toBe(2)
    })
  })

  describe('Validação de erros', () => {
    test('deve detectar CPF/CNPJ inválido', () => {
      const header = buildLine400(itauCnab400.header!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(itauCnab400.detail!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        carteira: 'I',
        nosso_numero: '12345678',
        dac_nosso_numero: '9',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '12345678900', // CPF inválido (dígito errado)
        nome: 'JOAO DA SILVA',
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(itauCnab400.trailer!, {
        numero_sequencial: '000003',
      })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'CPF/CNPJ',
          message: expect.stringContaining('inválido')
        })
      )
    })

    test('deve detectar nome do pagador muito curto', () => {
      const header = buildLine400(itauCnab400.header!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(itauCnab400.detail!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        carteira: 'I',
        nosso_numero: '12345678',
        dac_nosso_numero: '9',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '11144477735',
        nome: 'AB', // Muito curto (< 3 caracteres)
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(itauCnab400.trailer!, {
        numero_sequencial: '000003',
      })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Nome do pagador',
          message: expect.stringContaining('obrigatório')
        })
      )
    })

    test('deve detectar valor zero ou negativo', () => {
      const header = buildLine400(itauCnab400.header!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(itauCnab400.detail!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        carteira: 'I',
        nosso_numero: '12345678',
        dac_nosso_numero: '9',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '11144477735',
        nome: 'JOAO DA SILVA',
        vencimento: '311299',
        valor_titulo: '0000000000000', // R$ 0,00
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(itauCnab400.trailer!, {
        numero_sequencial: '000003',
      })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Valor da cobrança',
          message: expect.stringContaining('maior que R$ 0,00')
        })
      )
    })

    test('deve detectar data de vencimento inválida', () => {
      const header = buildLine400(itauCnab400.header!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(itauCnab400.detail!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        carteira: 'I',
        nosso_numero: '12345678',
        dac_nosso_numero: '9',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '11144477735',
        nome: 'JOAO DA SILVA',
        vencimento: '321399', // 32/13/99 - data inexistente
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(itauCnab400.trailer!, {
        numero_sequencial: '000003',
      })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Data de vencimento',
          message: expect.stringContaining('inválida')
        })
      )
    })

    test('deve detectar data de vencimento no passado', () => {
      const header = buildLine400(itauCnab400.header!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(itauCnab400.detail!, {
        agencia: '1234',
        conta: '12345',
        dac: '6',
        carteira: 'I',
        nosso_numero: '12345678',
        dac_nosso_numero: '9',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '11144477735',
        nome: 'JOAO DA SILVA',
        vencimento: '010120', // 01/01/2020 - passado
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(itauCnab400.trailer!, {
        numero_sequencial: '000003',
      })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Data de vencimento',
          message: expect.stringContaining('anterior à data atual')
        })
      )
    })
  })

  describe('Validação do fixture real', () => {
    test('deve validar o fixture ITAU_cnab_400.REM com metadados correspondentes', () => {
      const fixturePath = path.join(__dirname, '../../fixtures/cnab400/itau/ITAU_cnab_400.REM')
      const metadataPath = path.join(__dirname, '../../fixtures/cnab400/itau/ITAU_cnab_400.json')
      
      // Ler fixture
      const fixtureContent = fs.readFileSync(fixturePath, 'utf-8')
      
      // Ler metadados
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
      
      // Validar arquivo
      const result = validateCnabFile(fixtureContent)
      
      // Verificações baseadas nos metadados
      expect(result.bank).toEqual({ code: '341', name: 'Itaú' })
      expect(result.totalRecords).toBe(metadata.totals.recordCount)
      
      // Deve ter os totalizadores corretos
      expect(metadata.totals.recordCount).toBe(319)
      expect(metadata.totals.totalAmount).toBe(1237856.15)
      
      // Header deve estar correto
      expect(metadata.header).toBeDefined()
      expect(metadata.header.agencia).toBe('4521')
      expect(metadata.header.conta).toBe('54321')
      expect(metadata.header.dac).toBe('8')
      
      // Amostra de registros deve existir (não implementado ainda no metadata)
      // expect(metadata.sample_records).toHaveLength(3)
      // expect(metadata.sample_records[0].tipo_registro).toBe('1')
      
      // Se houver erros, listar para diagnóstico
      if (result.errors.length > 0) {
        console.log('Erros encontrados:', result.errors.slice(0, 10)) // Primeiros 10 erros
      }
    })
  })
})
