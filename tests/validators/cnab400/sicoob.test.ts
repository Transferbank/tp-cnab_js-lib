/**
 * Testes de validação CNAB 400 — Sicoob/Bancoob (756)
 *
 * Testa a validação completa de arquivos CNAB 400 do Sicoob incluindo:
 * - Estrutura do arquivo (header, detail, trailer)
 * - Particularidade de negócio: vencimento aceita os literais especiais
 *   '888888' (à vista) e '999999' (contra apresentação) em vez de uma data DDMMAA real
 */

import { validateCnabFile } from '../../../src'
import { sicoobCnab400 } from '../../../src/banks/sicoob/schemas/cnab400'
import { buildLine400 } from '../../helpers/cnab-builder'

describe('validateCnabFile — Sicoob/Bancoob (756) CNAB 400', () => {
  test('deve validar um arquivo bem formado sem erros', () => {
    const header = buildLine400(sicoobCnab400.header!, {
      prefixo_cooperativa: '1234',
      codigo_cliente_beneficiario: '00012345',
      dv_codigo_cliente: '6',
      nome_beneficiario: 'EMPRESA EXEMPLO',
      data_gravacao: '010126',
      numero_sequencial: '000001',
    })
    const detail = buildLine400(sicoobCnab400.detail!, {
      tipo_inscricao_beneficiario: '02',
      numero_inscricao_beneficiario: '00012345678901',
      prefixo_cooperativa: '1234',
      dv_prefixo: '6',
      conta_corrente: '00012345',
      dv_conta: '7',
      nosso_numero: '000000000001',
      carteira_modalidade: '01',
      comando_movimento: '01',
      numero_documento: 'DOC0000001',
      vencimento: '311299', // 31/12/2099 — sempre no futuro
      valor_titulo: '0000000010000', // R$ 100,00
      sacado_codigo_inscricao: '01',
      sacado_numero_inscricao: '00011144477735', // CPF válido (111.444.777-35) com zero-padding
      nome: 'JOAO DA SILVA',
      numero_sequencial: '000002',
    })
    const trailer = buildLine400(sicoobCnab400.trailer!, { numero_sequencial: '000003' })

    const result = validateCnabFile([header, detail, trailer].join('\n'))

    expect(result.errors).toEqual([])
    expect(result.valid).toBe(true)
    expect(result.bank).toEqual({ code: '756', name: 'Sicoob' })
    expect(result.totalRecords).toBe(1)
  })

  describe('Particularidade: vencimento com valores especiais', () => {
    test('deve aceitar vencimento "888888" (à vista) sem erro de data inválida', () => {
      const header = buildLine400(sicoobCnab400.header!, {
        prefixo_cooperativa: '1234',
        codigo_cliente_beneficiario: '00012345',
        dv_codigo_cliente: '6',
        nome_beneficiario: 'EMPRESA EXEMPLO',
        data_gravacao: '010126',
        numero_sequencial: '000001',
      })
      const detail = buildLine400(sicoobCnab400.detail!, {
        tipo_inscricao_beneficiario: '02',
        numero_inscricao_beneficiario: '00012345678901',
        prefixo_cooperativa: '1234',
        dv_prefixo: '6',
        conta_corrente: '00012345',
        dv_conta: '7',
        nosso_numero: '000000000001',
        carteira_modalidade: '01',
        comando_movimento: '01',
        numero_documento: 'DOC0000001',
        vencimento: '888888', // à vista
        valor_titulo: '0000000010000',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00011144477735',
        nome: 'JOAO DA SILVA',
        numero_sequencial: '000002',
      })
      const trailer = buildLine400(sicoobCnab400.trailer!, { numero_sequencial: '000003' })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
    })

    test('deve aceitar vencimento "999999" (contra apresentação) sem erro de data inválida', () => {
      const header = buildLine400(sicoobCnab400.header!, {
        prefixo_cooperativa: '1234',
        codigo_cliente_beneficiario: '00012345',
        dv_codigo_cliente: '6',
        nome_beneficiario: 'EMPRESA EXEMPLO',
        data_gravacao: '010126',
        numero_sequencial: '000001',
      })
      const detail = buildLine400(sicoobCnab400.detail!, {
        tipo_inscricao_beneficiario: '02',
        numero_inscricao_beneficiario: '00012345678901',
        prefixo_cooperativa: '1234',
        dv_prefixo: '6',
        conta_corrente: '00012345',
        dv_conta: '7',
        nosso_numero: '000000000001',
        carteira_modalidade: '01',
        comando_movimento: '01',
        numero_documento: 'DOC0000001',
        vencimento: '999999', // contra apresentação
        valor_titulo: '0000000010000',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00011144477735',
        nome: 'JOAO DA SILVA',
        numero_sequencial: '000002',
      })
      const trailer = buildLine400(sicoobCnab400.trailer!, { numero_sequencial: '000003' })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
    })

    test('deve continuar rejeitando uma data DDMMAA genuinamente inválida', () => {
      const header = buildLine400(sicoobCnab400.header!, {
        prefixo_cooperativa: '1234',
        codigo_cliente_beneficiario: '00012345',
        dv_codigo_cliente: '6',
        nome_beneficiario: 'EMPRESA EXEMPLO',
        data_gravacao: '010126',
        numero_sequencial: '000001',
      })
      const detail = buildLine400(sicoobCnab400.detail!, {
        tipo_inscricao_beneficiario: '02',
        numero_inscricao_beneficiario: '00012345678901',
        prefixo_cooperativa: '1234',
        dv_prefixo: '6',
        conta_corrente: '00012345',
        dv_conta: '7',
        nosso_numero: '000000000001',
        carteira_modalidade: '01',
        comando_movimento: '01',
        numero_documento: 'DOC0000001',
        vencimento: '321399', // 32/13/99 - data inexistente
        valor_titulo: '0000000010000',
        sacado_codigo_inscricao: '01',
        sacado_numero_inscricao: '00011144477735',
        nome: 'JOAO DA SILVA',
        numero_sequencial: '000002',
      })
      const trailer = buildLine400(sicoobCnab400.trailer!, { numero_sequencial: '000003' })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          column: 'Data de vencimento',
          message: expect.stringContaining('inválida'),
        }),
      )
    })
  })
})
