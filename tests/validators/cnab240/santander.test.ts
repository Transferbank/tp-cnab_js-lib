/**
 * Testes de validação CNAB 240 — Santander (033)
 * 
 * Testa a validação completa de arquivos CNAB 240 do Santander incluindo:
 * - Segmentos P e Q
 * - Validação de campos (valor, vencimento, documento, CPF/CNPJ)
 * - Múltiplos títulos (pares de Segmentos P + Q)
 */

import { validateCnab240Business } from '../../../src/validators/cnab240-business-validator'
import { santanderCnab240 } from '../../../src/banks/santander/schemas/cnab240'
import { buildLine240 } from '../../helpers/cnab-builder'

describe('validateCnab240Business — Santander (033)', () => {
  describe('Validação básica', () => {
    test('deve validar arquivo completo sem erros', () => {
      const header = buildLine240(santanderCnab240.headerArquivo!, {
        codigo_transmissao: '12340000001234567890',
        cedente_nome: 'EMPRESA TESTE',
        arquivo_data_de_geracao: '01072026'
      })
      
      const segP = buildLine240(santanderCnab240.segmentoP!, {
        cedente_conta_dv: '1',
        numero_documento: 'DOC0000001',
        data_emissao_titulo: '01072026',
        identificacao_titulo: 'TIT001',
        valor_titulo: '000000000010000', // R$ 100,00
        vencimento_titulo: '31122099', // 31/12/2099 - futuro
      })
      
      const segQ = buildLine240(santanderCnab240.segmentoQ!, {
        sacado_inscricao_numero: '000012345678909', // CPF válido com padding
        sacado_nome: 'JOAO DA SILVA',
        sacado_endereco: 'RUA EXEMPLO, 123'
      })
      
      const trailer = buildLine240(santanderCnab240.trailerArquivo!, {})
      
      const result = validateCnab240Business([header, segP, segQ, trailer], santanderCnab240)
      
      expect(result.errors).toEqual([])
      expect(result.records).toHaveLength(1)
      expect(result.records[0]).toMatchObject({
        name: 'JOAO DA SILVA',
        amount: 100.00,
        document: '12345678909' // Sem padding
      })
    })
  })

  describe('Validação de erros', () => {
    test('deve detectar CPF/CNPJ inválido no Segmento Q', () => {
      const header = buildLine240(santanderCnab240.headerArquivo!, {
        cedente_nome: 'EMPRESA TESTE',
        arquivo_data_de_geracao: '01072026'
      })
      const segP = buildLine240(santanderCnab240.segmentoP!, {
        valor_titulo: '000000000010000',
        vencimento_titulo: '31122099'
      })
      const segQ = buildLine240(santanderCnab240.segmentoQ!, {
        sacado_inscricao_numero: '000012345678900', // CPF inválido (dígito errado)
        sacado_nome: 'JOAO DA SILVA',
        sacado_endereco: 'RUA EXEMPLO'
      })
      const trailer = buildLine240(santanderCnab240.trailerArquivo!, {})
      
      const result = validateCnab240Business([header, segP, segQ, trailer], santanderCnab240)
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'CPF/CNPJ',
          message: expect.stringContaining('inválido')
        })
      )
    })

    test('deve detectar nome do pagador muito curto', () => {
      const header = buildLine240(santanderCnab240.headerArquivo!, {
        cedente_nome: 'EMPRESA TESTE',
        arquivo_data_de_geracao: '01072026'
      })
      const segP = buildLine240(santanderCnab240.segmentoP!, {
        valor_titulo: '000000000010000',
        vencimento_titulo: '31122099'
      })
      const segQ = buildLine240(santanderCnab240.segmentoQ!, {
        sacado_inscricao_numero: '000012345678909',
        sacado_nome: 'AB', // Muito curto (< 3 caracteres)
        sacado_endereco: 'RUA EXEMPLO'
      })
      const trailer = buildLine240(santanderCnab240.trailerArquivo!, {})
      
      const result = validateCnab240Business([header, segP, segQ, trailer], santanderCnab240)
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Nome do pagador',
          message: expect.stringContaining('obrigatório')
        })
      )
    })

    test('deve detectar valor zero ou negativo', () => {
      const header = buildLine240(santanderCnab240.headerArquivo!, {
        cedente_nome: 'EMPRESA TESTE',
        arquivo_data_de_geracao: '01072026'
      })
      const segP = buildLine240(santanderCnab240.segmentoP!, {
        valor_titulo: '000000000000000', // R$ 0,00
        vencimento_titulo: '31122099'
      })
      const segQ = buildLine240(santanderCnab240.segmentoQ!, {
        sacado_inscricao_numero: '000012345678909',
        sacado_nome: 'JOAO DA SILVA',
        sacado_endereco: 'RUA EXEMPLO'
      })
      const trailer = buildLine240(santanderCnab240.trailerArquivo!, {})
      
      const result = validateCnab240Business([header, segP, segQ, trailer], santanderCnab240)
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Valor da cobrança',
          message: expect.stringContaining('maior que R$ 0,00')
        })
      )
    })

    test('deve detectar data de vencimento inválida', () => {
      const header = buildLine240(santanderCnab240.headerArquivo!, {
        cedente_nome: 'EMPRESA TESTE',
        arquivo_data_de_geracao: '01072026'
      })
      const segP = buildLine240(santanderCnab240.segmentoP!, {
        valor_titulo: '000000000010000',
        vencimento_titulo: '32132099' // 32/13/2099 - data inexistente
      })
      const segQ = buildLine240(santanderCnab240.segmentoQ!, {
        sacado_inscricao_numero: '000012345678909',
        sacado_nome: 'JOAO DA SILVA',
        sacado_endereco: 'RUA EXEMPLO'
      })
      const trailer = buildLine240(santanderCnab240.trailerArquivo!, {})
      
      const result = validateCnab240Business([header, segP, segQ, trailer], santanderCnab240)
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Data de vencimento',
          message: expect.stringContaining('inválida')
        })
      )
    })

    test('deve detectar data de vencimento no passado', () => {
      const header = buildLine240(santanderCnab240.headerArquivo!, {
        cedente_nome: 'EMPRESA TESTE',
        arquivo_data_de_geracao: '01072026'
      })
      const segP = buildLine240(santanderCnab240.segmentoP!, {
        valor_titulo: '000000000010000',
        vencimento_titulo: '01012020' // 01/01/2020 - passado
      })
      const segQ = buildLine240(santanderCnab240.segmentoQ!, {
        sacado_inscricao_numero: '000012345678909',
        sacado_nome: 'JOAO DA SILVA',
        sacado_endereco: 'RUA EXEMPLO'
      })
      const trailer = buildLine240(santanderCnab240.trailerArquivo!, {})
      
      const result = validateCnab240Business([header, segP, segQ, trailer], santanderCnab240)
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Data de vencimento',
          message: expect.stringContaining('anterior à data atual')
        })
      )
    })
  })

  describe('Múltiplos títulos (pares de Segmentos P + Q)', () => {
    test('deve validar arquivo com 2 títulos', () => {
      const header = buildLine240(santanderCnab240.headerArquivo!, {
        codigo_transmissao: '12340000001234567890',
        cedente_nome: 'EMPRESA TESTE',
        arquivo_data_de_geracao: '01072026'
      })
      
      // Título 1
      const segP1 = buildLine240(santanderCnab240.segmentoP!, {
        cedente_conta_dv: '1',
        numero_documento: 'DOC0000001',
        data_emissao_titulo: '01072026',
        identificacao_titulo: 'TIT001',
        valor_titulo: '000000000010000',
        vencimento_titulo: '31122099'
      })
      const segQ1 = buildLine240(santanderCnab240.segmentoQ!, {
        sacado_inscricao_numero: '000012345678909',
        sacado_nome: 'JOAO DA SILVA',
        sacado_endereco: 'RUA EXEMPLO, 123'
      })
      
      // Título 2
      const segP2 = buildLine240(santanderCnab240.segmentoP!, {
        cedente_conta_dv: '1',
        numero_documento: 'DOC0000002',
        data_emissao_titulo: '01072026',
        identificacao_titulo: 'TIT002',
        valor_titulo: '000000000020000',
        vencimento_titulo: '31122099'
      })
      const segQ2 = buildLine240(santanderCnab240.segmentoQ!, {
        sacado_inscricao_numero: '000011144477735',
        sacado_nome: 'MARIA SANTOS',
        sacado_endereco: 'AV TESTE, 456'
      })
      
      const trailer = buildLine240(santanderCnab240.trailerArquivo!, {})
      
      const result = validateCnab240Business(
        [header, segP1, segQ1, segP2, segQ2, trailer],
        santanderCnab240
      )
      
      expect(result.errors).toEqual([])
      expect(result.records).toHaveLength(2)
      expect(result.records[0].name).toBe('JOAO DA SILVA')
      expect(result.records[0].amount).toBe(100.00)
      expect(result.records[1].name).toBe('MARIA SANTOS')
      expect(result.records[1].amount).toBe(200.00)
    })

    test('deve casar cada Segmento Q com seu Segmento P correspondente', () => {
      const header = buildLine240(santanderCnab240.headerArquivo!, {
        cedente_nome: 'EMPRESA TESTE',
        arquivo_data_de_geracao: '01072026'
      })
      
      const segP1 = buildLine240(santanderCnab240.segmentoP!, {
        valor_titulo: '000000000050000', // R$ 500
        vencimento_titulo: '15082099'
      })
      const segQ1 = buildLine240(santanderCnab240.segmentoQ!, {
        sacado_inscricao_numero: '000012345678909',
        sacado_nome: 'PAGADOR UM',
        sacado_endereco: 'ENDERECO UM'
      })
      
      const segP2 = buildLine240(santanderCnab240.segmentoP!, {
        valor_titulo: '000000000075000', // R$ 750
        vencimento_titulo: '20092099'
      })
      const segQ2 = buildLine240(santanderCnab240.segmentoQ!, {
        sacado_inscricao_numero: '000011144477735',
        sacado_nome: 'PAGADOR DOIS',
        sacado_endereco: 'ENDERECO DOIS'
      })
      
      const trailer = buildLine240(santanderCnab240.trailerArquivo!, {})
      
      const result = validateCnab240Business(
        [header, segP1, segQ1, segP2, segQ2, trailer],
        santanderCnab240
      )
      
      expect(result.records[0].name).toBe('PAGADOR UM')
      expect(result.records[0].amount).toBe(500.00)
      expect(result.records[0].dueDate).toBe('15/08/2099')
      
      expect(result.records[1].name).toBe('PAGADOR DOIS')
      expect(result.records[1].amount).toBe(750.00)
      expect(result.records[1].dueDate).toBe('20/09/2099')
    })
  })
})

