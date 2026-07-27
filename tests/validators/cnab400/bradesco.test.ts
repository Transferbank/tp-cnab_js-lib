/**
 * Testes de validação CNAB 400 — Bradesco (237)
 * 
 * Testa a validação completa de arquivos CNAB 400 do Bradesco incluindo:
 * - Estrutura do arquivo (header, detail, trailer)
 * - Validação de campos (valor, vencimento, documento, CPF/CNPJ)
 * - Múltiplos detalhes
 */

import { validateCnabFile } from '../../../src'
import { bradescoCnab400 } from '../../../src/banks/bradesco/schemas/cnab400'
import { buildLine400 } from '../../helpers/cnab-builder'

describe('validateCnabFile — Bradesco (237) CNAB 400', () => {
  describe('Validação básica', () => {
    test('deve validar um arquivo bem formado sem erros', () => {
      const header = buildLine400(bradescoCnab400.header!, {
        codigo_cedente: 'CEDENTE0001',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        sequencial_remessa: '1',
        numero_sequencial: '1',
      })
      const detail = buildLine400(bradescoCnab400.detail!, {
        carteira_codigo: '109',
        agencia_cedente: '1',
        conta_cedente: '1',
        conta_cedente_dv: '0',
        nosso_numero: '1',
        nosso_numero_dv: '0',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00011144477735', // CPF válido (111.444.777-35) com zero-padding
        nome: 'JOAO DA SILVA',
        vencimento: '311299', // 31/12/2099 — sempre no futuro
        valor_titulo: '0000000010000', // R$ 100,00
        numero_sequencial: '2',
      })
      const trailer = buildLine400(bradescoCnab400.trailer!, { numero_sequencial: '3' })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
      expect(result.bank).toEqual({ code: '237', name: 'Bradesco' })
      expect(result.totalRecords).toBe(1)
    })

    test('deve validar arquivo com múltiplos detalhes', () => {
      const header = buildLine400(bradescoCnab400.header!, {
        codigo_cedente: 'CEDENTE0001',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        sequencial_remessa: '1',
        numero_sequencial: '1',
      })
      
      const detail1 = buildLine400(bradescoCnab400.detail!, {
        carteira_codigo: '109',
        agencia_cedente: '1',
        conta_cedente: '1',
        conta_cedente_dv: '0',
        nosso_numero: '1',
        nosso_numero_dv: '0',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00011144477735',
        nome: 'JOAO DA SILVA',
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '2',
      })
      
      const detail2 = buildLine400(bradescoCnab400.detail!, {
        carteira_codigo: '109',
        agencia_cedente: '1',
        conta_cedente: '1',
        conta_cedente_dv: '0',
        nosso_numero: '1',
        nosso_numero_dv: '0',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00012345678909',
        nome: 'MARIA SANTOS',
        vencimento: '151299',
        valor_titulo: '0000000020000',
        numero_sequencial: '3',
      })
      
      const trailer = buildLine400(bradescoCnab400.trailer!, { numero_sequencial: '4' })

      const result = validateCnabFile([header, detail1, detail2, trailer].join('\n'))

      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
      expect(result.totalRecords).toBe(2)
    })
  })

  describe('Validação de erros', () => {
    test('deve detectar CPF/CNPJ inválido', () => {
      const header = buildLine400(bradescoCnab400.header!, {
        codigo_cedente: 'CEDENTE0001',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        sequencial_remessa: '1',
        numero_sequencial: '1',
      })
      const detail = buildLine400(bradescoCnab400.detail!, {
        carteira_codigo: '109',
        agencia_cedente: '1',
        conta_cedente: '1',
        conta_cedente_dv: '0',
        nosso_numero: '1',
        nosso_numero_dv: '0',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00012345678900', // CPF inválido (dígito errado)
        nome: 'JOAO DA SILVA',
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '2',
      })
      const trailer = buildLine400(bradescoCnab400.trailer!, { numero_sequencial: '3' })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'CPF/CNPJ',
          message: expect.stringContaining('inválido')
        })
      )
    })

    test('deve detectar nome do pagador muito curto', () => {
      const header = buildLine400(bradescoCnab400.header!, {
        codigo_cedente: 'CEDENTE0001',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        sequencial_remessa: '1',
        numero_sequencial: '1',
      })
      const detail = buildLine400(bradescoCnab400.detail!, {
        carteira_codigo: '109',
        agencia_cedente: '1',
        conta_cedente: '1',
        conta_cedente_dv: '0',
        nosso_numero: '1',
        nosso_numero_dv: '0',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00011144477735',
        nome: 'AB', // Muito curto (< 3 caracteres)
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '2',
      })
      const trailer = buildLine400(bradescoCnab400.trailer!, { numero_sequencial: '3' })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Nome do pagador',
          message: expect.stringContaining('obrigatório')
        })
      )
    })

    test('deve detectar valor zero ou negativo', () => {
      const header = buildLine400(bradescoCnab400.header!, {
        codigo_cedente: 'CEDENTE0001',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        sequencial_remessa: '1',
        numero_sequencial: '1',
      })
      const detail = buildLine400(bradescoCnab400.detail!, {
        carteira_codigo: '109',
        agencia_cedente: '1',
        conta_cedente: '1',
        conta_cedente_dv: '0',
        nosso_numero: '1',
        nosso_numero_dv: '0',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00011144477735',
        nome: 'JOAO DA SILVA',
        vencimento: '311299',
        valor_titulo: '0000000000000', // R$ 0,00
        numero_sequencial: '2',
      })
      const trailer = buildLine400(bradescoCnab400.trailer!, { numero_sequencial: '3' })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Valor da cobrança',
          message: expect.stringContaining('maior que R$ 0,00')
        })
      )
    })

    test('deve detectar data de vencimento inválida', () => {
      const header = buildLine400(bradescoCnab400.header!, {
        codigo_cedente: 'CEDENTE0001',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        sequencial_remessa: '1',
        numero_sequencial: '1',
      })
      const detail = buildLine400(bradescoCnab400.detail!, {
        carteira_codigo: '109',
        agencia_cedente: '1',
        conta_cedente: '1',
        conta_cedente_dv: '0',
        nosso_numero: '1',
        nosso_numero_dv: '0',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00011144477735',
        nome: 'JOAO DA SILVA',
        vencimento: '321399', // 32/13/99 - data inexistente
        valor_titulo: '0000000010000',
        numero_sequencial: '2',
      })
      const trailer = buildLine400(bradescoCnab400.trailer!, { numero_sequencial: '3' })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Data de vencimento',
          message: expect.stringContaining('inválida')
        })
      )
    })

    test('deve detectar data de vencimento no passado', () => {
      const header = buildLine400(bradescoCnab400.header!, {
        codigo_cedente: 'CEDENTE0001',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        sequencial_remessa: '1',
        numero_sequencial: '1',
      })
      const detail = buildLine400(bradescoCnab400.detail!, {
        carteira_codigo: '109',
        agencia_cedente: '1',
        conta_cedente: '1',
        conta_cedente_dv: '0',
        nosso_numero: '1',
        nosso_numero_dv: '0',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00011144477735',
        nome: 'JOAO DA SILVA',
        vencimento: '010120', // 01/01/2020 - passado
        valor_titulo: '0000000010000',
        numero_sequencial: '2',
      })
      const trailer = buildLine400(bradescoCnab400.trailer!, { numero_sequencial: '3' })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Data de vencimento',
          message: expect.stringContaining('anterior à data atual')
        })
      )
    })

    test('NÃO deve aceitar vencimento "888888"/"999999" como literal especial — exceção é exclusiva do Sicoob', () => {
      const header = buildLine400(bradescoCnab400.header!, {
        codigo_cedente: 'CEDENTE0001',
        nome_empresa: 'EMPRESA EXEMPLO',
        data_geracao: '010126',
        sequencial_remessa: '1',
        numero_sequencial: '1',
      })
      const detail = buildLine400(bradescoCnab400.detail!, {
        carteira_codigo: '109',
        agencia_cedente: '1',
        conta_cedente: '1',
        conta_cedente_dv: '0',
        nosso_numero: '1',
        nosso_numero_dv: '0',
        numero_documento: 'DOC0000001',
        data_emissao: '010126',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00011144477735',
        nome: 'JOAO DA SILVA',
        vencimento: '888888', // literal especial do Sicoob — não deve ter efeito no Bradesco
        valor_titulo: '0000000010000',
        numero_sequencial: '2',
      })
      const trailer = buildLine400(bradescoCnab400.trailer!, { numero_sequencial: '3' })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Data de vencimento',
          message: expect.stringContaining('inválida'),
        }),
      )
      expect(result.valid).toBe(false)
    })
  })
})
