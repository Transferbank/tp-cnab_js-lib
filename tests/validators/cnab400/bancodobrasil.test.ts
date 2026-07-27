/**
 * Testes de validação CNAB 400 — Banco do Brasil (001)
 * 
 * Testa a validação completa de arquivos CNAB 400 do Banco do Brasil incluindo:
 * - Estrutura do arquivo (header, detail tipo 7, trailer)
 * - Validação de campos (valor, vencimento, documento, CPF/CNPJ)
 * - Particularidades do BB: tipo de registro '7' (não '1')
 * - Múltiplos detalhes tipo 7
 * - Registros tipo 5 (multa) intercalados são ignorados pela API
 */

import { validateCnabFile } from '../../../src'
import { bancoDoBrasilCnab400 } from '../../../src/banks/bancoDoBrasil/schemas/cnab400'
import { buildLine400 } from '../../helpers/cnab-builder'

describe('validateCnabFile — Banco do Brasil (001) CNAB 400', () => {
  describe('Validação básica', () => {
    test('deve validar um arquivo bem formado sem erros', () => {
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044534', // 17 posições (particularidade do BB)
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000000997396', // CNPJ válido
        nome: 'COMERCIAL ALFA LTDA', // 37 caracteres permitidos no BB
        logradouro: 'AV EXEMPLO 100',
        cep: '78285000',
        cidade: 'SAO JOSE DOS QU',
        estado: 'MT',
        vencimento: '311299', // 31/12/2099 — sempre no futuro
        valor_titulo: '0000000010000', // R$ 100,00
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
        numero_sequencial: '000003',
      })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
      expect(result.bank).toEqual({ code: '001', name: 'Banco do Brasil' })
      expect(result.totalRecords).toBe(1)
    })

    test('deve validar arquivo com múltiplos detalhes tipo 7', () => {
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail1 = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044534',
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000000997396',
        nome: 'COMERCIAL ALFA LTDA',
        logradouro: 'AV EXEMPLO 100',
        cep: '78285000',
        cidade: 'SAO JOSE DOS QU',
        estado: 'MT',
        vencimento: '311299',
        valor_titulo: '0000000339020', // R$ 3.390,20
        numero_sequencial: '000002',
      })
      
      const detail2 = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044535',
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-02',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000001994668',
        nome: 'DISTRIBUIDORA ALFA LTDA',
        logradouro: 'RUA EXEMPLO 107',
        cep: '65775000',
        cidade: 'GONCALVES DIAS',
        estado: 'MA',
        vencimento: '151299',
        valor_titulo: '0000000230030', // R$ 2.300,30
        numero_sequencial: '000003',
      })
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
        numero_sequencial: '000004',
      })

      const result = validateCnabFile([header, detail1, detail2, trailer].join('\n'))

      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
      expect(result.totalRecords).toBe(2)
      expect(result.records[0].amount).toBe(3390.20)
      expect(result.records[1].amount).toBe(2300.30)
    })

    test('deve ignorar registros tipo 5 (multa) intercalados entre detalhes', () => {
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044534',
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000000997396',
        nome: 'COMERCIAL ALFA LTDA',
        logradouro: 'AV EXEMPLO 100',
        cep: '78285000',
        cidade: 'SAO JOSE DOS QU',
        estado: 'MT',
        vencimento: '311299',
        valor_titulo: '0000000339020',
        numero_sequencial: '000002',
      })
      
      // Registro tipo 5 (multa) - será ignorado pela API
      const tipo5 = '5' + // tipo_registro
                    '99' + // tipo_servico (multa)
                    '1' + // codigo_multa
                    '200726' + // data_multa
                    '000000000200' + // valor_percentual (2%)
                    ' '.repeat(372) + // brancos
                    '000003' // numero_sequencial
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
        numero_sequencial: '000004',
      })

      const result = validateCnabFile([header, detail, tipo5, trailer].join('\n'))

      // Deve processar apenas o detalhe tipo 7, ignorando o tipo 5
      expect(result.valid).toBe(true)
      expect(result.totalRecords).toBe(1)
      expect(result.errors).toEqual([])
    })
  })

  describe('Validação de erros', () => {
    test('deve detectar CPF/CNPJ inválido', () => {
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044534',
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '12345678000100', // CNPJ inválido (dígito errado)
        nome: 'EMPRESA TESTE LTDA',
        logradouro: 'RUA EXEMPLO 123',
        cep: '01234567',
        cidade: 'SAO PAULO',
        estado: 'SP',
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
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
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044534',
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000000997396',
        nome: 'AB', // Muito curto (< 3 caracteres)
        logradouro: 'RUA EXEMPLO 123',
        cep: '01234567',
        cidade: 'SAO PAULO',
        estado: 'SP',
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
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
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044534',
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000000997396',
        nome: 'EMPRESA TESTE LTDA',
        logradouro: 'RUA EXEMPLO 123',
        cep: '01234567',
        cidade: 'SAO PAULO',
        estado: 'SP',
        vencimento: '311299',
        valor_titulo: '0000000000000', // R$ 0,00
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
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
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044534',
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000000997396',
        nome: 'EMPRESA TESTE LTDA',
        logradouro: 'RUA EXEMPLO 123',
        cep: '01234567',
        cidade: 'SAO PAULO',
        estado: 'SP',
        vencimento: '321399', // 32/13/99 - data inexistente
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
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
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044534',
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000000997396',
        nome: 'EMPRESA TESTE LTDA',
        logradouro: 'RUA EXEMPLO 123',
        cep: '01234567',
        cidade: 'SAO PAULO',
        estado: 'SP',
        vencimento: '010120', // 01/01/2020 - passado
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
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

    test('deve validar campo nome com 37 caracteres (particularidade do BB)', () => {
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      // Nome com exatamente 37 caracteres (máximo permitido no BB)
      const nome37chars = 'NOME COMPLETO DA EMPRESA AQUI LTDA-EP'
      expect(nome37chars.length).toBe(37)
      
      const detail = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044534',
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000000997396',
        nome: nome37chars,
        logradouro: 'RUA EXEMPLO 123',
        cep: '01234567',
        cidade: 'SAO PAULO',
        estado: 'SP',
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
        numero_sequencial: '000003',
      })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
      expect(result.records[0].name.trim()).toBe(nome37chars)
    })

    test('deve validar nosso número com 17 posições (particularidade do BB)', () => {
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      // Nosso número com 17 posições (especificidade do BB)
      const nossoNumero17 = '90076541000044534'
      expect(nossoNumero17.length).toBe(17)

      const detail = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: nossoNumero17,
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000000997396',
        nome: 'EMPRESA TESTE LTDA',
        logradouro: 'RUA EXEMPLO 123',
        cep: '01234567',
        cidade: 'SAO PAULO',
        estado: 'SP',
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
        numero_sequencial: '000003',
      })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.errors).toEqual([])
      expect(result.valid).toBe(true)
    })
  })

  describe('Particularidades do Banco do Brasil', () => {
    test('deve processar corretamente registro tipo 7 (não tipo 1)', () => {
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044534',
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000000997396',
        nome: 'EMPRESA TESTE LTDA',
        logradouro: 'RUA EXEMPLO 123',
        cep: '01234567',
        cidade: 'SAO PAULO',
        estado: 'SP',
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
        numero_sequencial: '000003',
      })

      // Verificar que o detalhe tem tipo '7' (particularidade do BB)
      expect(detail[0]).toBe('7')
      
      const result = validateCnabFile([header, detail, trailer].join('\n'))

      expect(result.valid).toBe(true)
      expect(result.totalRecords).toBe(1)
    })

    test('trailer do BB não possui totalizadores (diferente de outros bancos)', () => {
      const header = buildLine400(bancoDoBrasilCnab400.header!, {
        agencia: '4321',
        agencia_dv: '0',
        conta: '00012345',
        conta_dv: '7',
        convenio_lider: '9007654',
        nome_empresa: 'EMPRESA EXEMPLO LTDA',
        data_geracao: '010126',
        numero_sequencial: '000001',
      })
      
      const detail = buildLine400(bancoDoBrasilCnab400.detail!, {
        agencia: '4321',
        conta: '00012345',
        convenio: '9007654',
        nosso_numero: '90076541000044534',
        numero_carteira: '17',
        comando: '01',
        numero_documento: 'NF12345-01',
        data_emissao: '010126',
        sacado_codigo_inscricao: '02',
        sacado_numero_inscricao: '01000000997396',
        nome: 'EMPRESA TESTE LTDA',
        logradouro: 'RUA EXEMPLO 123',
        cep: '01234567',
        cidade: 'SAO PAULO',
        estado: 'SP',
        vencimento: '311299',
        valor_titulo: '0000000010000',
        numero_sequencial: '000002',
      })
      
      const trailer = buildLine400(bancoDoBrasilCnab400.trailer!, {
        numero_sequencial: '000003',
      })

      const result = validateCnabFile([header, detail, trailer].join('\n'))

      // Validador não deve reclamar de qtd_documentos ausente
      // (BB não tem esse campo no trailer)
      const errosTrailer = result.errors.filter(e => 
        e.column?.includes('Trailer') || 
        e.column?.includes('Quantidade')
      )
      
      expect(errosTrailer).toEqual([])
      expect(result.valid).toBe(true)
    })
  })
})
