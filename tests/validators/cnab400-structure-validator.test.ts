/**
 * Testes para o validador estrutural de CNAB 400
 */

import { validateCnab400Structure } from '../../src/validators/cnab400-structure-validator'
import { getBankSchema } from '../../src/schemas'
import { BankSchema } from '../../src/types'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('validateCnab400Structure', () => {
  describe('Guards iniciais', () => {
    test('deve rejeitar arquivo com menos de 3 linhas', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = ['X'.repeat(400)]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].message).toContain('no mínimo 3 registros')
      expect(result.detailCount).toBe(0)
    })

    test('deve rejeitar quando schema não define header', () => {
      const incompleteSchema: BankSchema = {
        bankCode: '999',
        bankName: 'Teste',
        detail: { tipo_registro: { pos: [1, 1], type: 'num', size: 1, decimals: 0, required: true, dateFormat: null, pattern: '1', description: 'Tipo', canonical: null } },
        trailer: { tipo_registro: { pos: [1, 1], type: 'num', size: 1, decimals: 0, required: true, dateFormat: null, pattern: '9', description: 'Tipo', canonical: null } },
      }

      const lines = ['0'.repeat(400), '1'.repeat(400), '9'.repeat(400)]

      const result = validateCnab400Structure(lines, incompleteSchema)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 1,
          column: 'Schema',
          message: 'Schema do banco não define header para CNAB 400',
        })
      )
    })

    test('deve rejeitar quando schema não define detail', () => {
      const incompleteSchema: BankSchema = {
        bankCode: '999',
        bankName: 'Teste',
        header: { tipo_registro: { pos: [1, 1], type: 'num', size: 1, decimals: 0, required: true, dateFormat: null, pattern: '0', description: 'Tipo', canonical: null } },
        trailer: { tipo_registro: { pos: [1, 1], type: 'num', size: 1, decimals: 0, required: true, dateFormat: null, pattern: '9', description: 'Tipo', canonical: null } },
      }

      const lines = ['0'.repeat(400), '1'.repeat(400), '9'.repeat(400)]

      const result = validateCnab400Structure(lines, incompleteSchema)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 1,
          column: 'Schema',
          message: 'Schema do banco não define detail para CNAB 400',
        })
      )
    })

    test('deve rejeitar quando schema não define trailer', () => {
      const incompleteSchema: BankSchema = {
        bankCode: '999',
        bankName: 'Teste',
        header: { tipo_registro: { pos: [1, 1], type: 'num', size: 1, decimals: 0, required: true, dateFormat: null, pattern: '0', description: 'Tipo', canonical: null } },
        detail: { tipo_registro: { pos: [1, 1], type: 'num', size: 1, decimals: 0, required: true, dateFormat: null, pattern: '1', description: 'Tipo', canonical: null } },
      }

      const lines = ['0'.repeat(400), '1'.repeat(400), '9'.repeat(400)]

      const result = validateCnab400Structure(lines, incompleteSchema)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 1,
          column: 'Schema',
          message: 'Schema do banco não define trailer para CNAB 400',
        })
      )
    })
  })

  describe('Validação de tamanho de linha', () => {
    test('deve rejeitar linha com tamanho incorreto', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(400), // Header
        '1'.repeat(250), // LINHA INCORRETA - 250 chars
        '9'.repeat(400), // Trailer
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 2,
          column: 'Tamanho do registro',
          message: 'Esperado 400 caracteres, encontrado 250',
        })
      )
    })

    test('deve rejeitar múltiplas linhas com tamanho incorreto', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(350), // Header incorreto
        '1'.repeat(400),
        '1'.repeat(450), // Detalhe incorreto
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 1,
          column: 'Tamanho do registro',
          message: 'Esperado 400 caracteres, encontrado 350',
        })
      )
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 3,
          column: 'Tamanho do registro',
          message: 'Esperado 400 caracteres, encontrado 450',
        })
      )
    })
  })

  describe('Posicionamento de Header', () => {
    test('deve aceitar Header na primeira linha', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(400), // Header na primeira linha
        '1'.repeat(400),
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bradesco)

      const headerErrors = result.errors.filter(e => e.column === 'Header')
      expect(headerErrors).toHaveLength(0)
    })

    test('deve rejeitar Header com tipo incorreto na primeira linha', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '1'.repeat(400), // Tipo errado (1 ao invés de 0)
        '1'.repeat(400),
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 1,
          column: 'Header',
          message: expect.stringContaining('deve ser Header (tipo 0)'),
        })
      )
    })

    test('deve rejeitar Header no meio do arquivo', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(400),
        '1'.repeat(400),
        '0'.repeat(400), // Header no meio
        '1'.repeat(400),
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 3,
          column: 'Header',
          message: 'Header encontrado no meio do arquivo (deve estar apenas na primeira linha)',
        })
      )
    })
  })

  describe('Posicionamento de Trailer', () => {
    test('deve aceitar Trailer na última linha', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(400),
        '1'.repeat(400),
        '9'.repeat(400), // Trailer na última linha
      ]

      const result = validateCnab400Structure(lines, bradesco)

      const trailerErrors = result.errors.filter(e => e.column === 'Trailer' && e.line === 3)
      expect(trailerErrors).toHaveLength(0)
    })

    test('deve rejeitar Trailer com tipo incorreto na última linha', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(400),
        '1'.repeat(400),
        '1'.repeat(400), // Tipo errado (1 ao invés de 9)
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 3,
          column: 'Trailer',
          message: expect.stringContaining('deve ser Trailer (tipo 9)'),
        })
      )
    })

    test('deve rejeitar Trailer no meio do arquivo', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(400),
        '9'.repeat(400), // Trailer no meio
        '1'.repeat(400),
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 2,
          column: 'Trailer',
          message: 'Trailer encontrado no meio do arquivo (deve estar apenas na última linha)',
        })
      )
    })
  })

  describe('Registros de Detalhe', () => {
    test('deve contar detalhes corretamente', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(400),
        '1'.repeat(400),
        '1'.repeat(400),
        '1'.repeat(400),
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.detailCount).toBe(3)
    })

    test('deve rejeitar arquivo sem detalhes', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(400),
        '5'.repeat(400), // Tipo desconhecido - não conta como detail
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 2,
          column: 'Detalhe',
          message: 'Arquivo deve conter pelo menos um registro de detalhe',
        })
      )
      expect(result.detailCount).toBe(0)
    })

    test('deve aceitar arquivo com apenas 1 detalhe', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(400),
        '1'.repeat(400), // Apenas 1 detalhe
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.detailCount).toBe(1)
      const detailErrors = result.errors.filter(e => e.column === 'Detalhe')
      expect(detailErrors).toHaveLength(0)
    })

    test('deve rejeitar tipo de registro desconhecido no meio', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(400),
        '1'.repeat(400),
        '5'.repeat(400), // Tipo desconhecido
        '1'.repeat(400),
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 3,
          column: 'Tipo de registro',
          message: expect.stringContaining('não corresponde a nenhum tipo reconhecido'),
        })
      )
      expect(result.detailCount).toBe(2) // Apenas os detalhes válidos
    })
  })

  describe('Leitura de tipo_registro.pattern do schema', () => {
    test('deve ler tipo de detail do Banco do Brasil (tipo 7)', () => {
      const bb = getBankSchema('001', 'cnab400')!
      const lines = [
        '0'.repeat(400),
        '7'.repeat(400), // BB usa tipo 7 para detail
        '7'.repeat(400),
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bb)

      expect(result.detailCount).toBe(2)
      const detailErrors = result.errors.filter(e => e.column?.includes('Tipo de registro'))
      expect(detailErrors).toHaveLength(0)
    })

    test('deve rejeitar tipo 1 quando banco usa tipo 7 (Banco do Brasil)', () => {
      const bb = getBankSchema('001', 'cnab400')!
      const lines = [
        '0'.repeat(400),
        '1'.repeat(400), // Tipo errado para BB
        '7'.repeat(400),
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bb)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 2,
          column: 'Tipo de registro',
          message: expect.stringContaining('não corresponde a nenhum tipo reconhecido'),
        })
      )
    })
  })

  describe('Validação de quantidade de documentos no trailer', () => {
    test('deve aceitar quando quantidade no trailer bate com detailCount', () => {
      const santander = getBankSchema('033', 'cnab400')!
      
      // Criar trailer com quantidade = 3 na posição correta do Santander (2-7, 6 dígitos)
      const trailerLine = '9' + '000003' + '0'.repeat(393)
      
      const lines = [
        '0'.repeat(400),
        '1'.repeat(400),
        '1'.repeat(400),
        '1'.repeat(400), // 3 detalhes
        trailerLine,
      ]

      const result = validateCnab400Structure(lines, santander)

      const quantityErrors = result.errors.filter(e => e.column === 'Quantidade no Trailer')
      expect(quantityErrors).toHaveLength(0)
      expect(result.detailCount).toBe(3)
    })

    test('deve rejeitar quando quantidade no trailer não bate', () => {
      const santander = getBankSchema('033', 'cnab400')!
      
      // Trailer declara 5, mas arquivo tem apenas 3 detalhes (posição 2-7, 6 dígitos)
      const trailerLine = '9' + '000005' + '0'.repeat(393)
      
      const lines = [
        '0'.repeat(400),
        '1'.repeat(400),
        '1'.repeat(400),
        '1'.repeat(400), // 3 detalhes
        trailerLine,
      ]

      const result = validateCnab400Structure(lines, santander)

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 5,
          column: 'Quantidade no Trailer',
          message: 'Trailer declara 5 títulos, mas o arquivo contém 3',
        })
      )
    })

    test('deve ignorar validação quando banco não define qtd_documentos', () => {
      const itau = getBankSchema('341', 'cnab400')!
      
      const lines = [
        '0'.repeat(400),
        '1'.repeat(400),
        '1'.repeat(400), // 2 detalhes
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, itau)

      // Não deve ter erro de quantidade (Itaú não define qtd_documentos)
      const quantityErrors = result.errors.filter(e => e.column === 'Quantidade no Trailer')
      expect(quantityErrors).toHaveLength(0)
      expect(result.detailCount).toBe(2)
    })
  })

  describe('Validação com fixtures reais', () => {
    test('deve validar fixture real do Bradesco CNAB 400', () => {
      const fixturePath = join(__dirname, '../fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const lines = fileContent.split(/\r?\n/).filter(l => l.length > 0)
      const bradesco = getBankSchema('237', 'cnab400')!

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.detailCount).toBeGreaterThan(0)
      
      // Não deve ter erros estruturais críticos
      const criticalErrors = result.errors.filter(e => 
        e.message.includes('Tamanho do registro') ||
        e.message.includes('deve ser Header') ||
        e.message.includes('deve ser Trailer') ||
        e.message.includes('no mínimo 3 registros')
      )
      expect(criticalErrors).toHaveLength(0)
    })

    test('deve validar fixture real do Banco do Brasil CNAB 400', () => {
      const fixturePath = join(__dirname, '../fixtures/cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const lines = fileContent.split(/\r?\n/).filter(l => l.length > 0)
      const bb = getBankSchema('001', 'cnab400')!

      const result = validateCnab400Structure(lines, bb)

      expect(result.detailCount).toBeGreaterThan(0)
      
      const criticalErrors = result.errors.filter(e => 
        e.message.includes('Tamanho do registro') ||
        e.message.includes('deve ser Header') ||
        e.message.includes('deve ser Trailer')
      )
      expect(criticalErrors).toHaveLength(0)
    })

    test('deve validar fixture real do BB sem falsos positivos em registros opcionais tipo 5', () => {
      // TESTE DE REGRESSÃO: Bug original - validador gerava 113 falsos positivos
      // para registros tipo 5 (multa/descontos/negativador) por não reconhecê-los
      // como registros opcionais válidos.
      //
      // O arquivo BANCOBRASIL_cnab_400.REM contém:
      // - 113 linhas tipo 5 com tipo_servico '99' (multa) - registros opcionais válidos
      // - Antes da correção: 113 erros "Tipo de registro '5' não reconhecido"
      // - Depois da correção: 0 erros desse tipo (registros reconhecidos via optionalRecords)
      
      const fixturePath = join(__dirname, '../fixtures/cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const lines = fileContent.split(/\r?\n/).filter(l => l.length > 0)
      const bb = getBankSchema('001', 'cnab400')!

      const result = validateCnab400Structure(lines, bb)

      // Não deve haver nenhum erro de "tipo de registro não reconhecido"
      const recordTypeErrors = result.errors.filter(e => 
        e.column === 'Tipo de registro' ||
        e.message.includes('não reconhecido') ||
        e.message.includes('não corresponde a nenhum tipo')
      )
      
      expect(recordTypeErrors).toHaveLength(0)
      
      // Confirmação adicional: o arquivo deve ter exatamente 113 registros tipo 5
      const type5Lines = lines.filter(line => line.charAt(0) === '5')
      expect(type5Lines).toHaveLength(113)
      
      // Todos devem ser tipo_servico '99' (multa)
      const type5Service99 = type5Lines.filter(line => line.substring(1, 3) === '99')
      expect(type5Service99).toHaveLength(113)
    })

    test('deve validar fixture real do Itaú CNAB 400', () => {
      const fixturePath = join(__dirname, '../fixtures/cnab400/itau/ITAU_cnab_400.REM')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const lines = fileContent.split(/\r?\n/).filter(l => l.length > 0)
      const itau = getBankSchema('341', 'cnab400')!

      const result = validateCnab400Structure(lines, itau)

      expect(result.detailCount).toBeGreaterThan(0)
      
      const criticalErrors = result.errors.filter(e => 
        e.message.includes('Tamanho do registro') ||
        e.message.includes('deve ser Header') ||
        e.message.includes('deve ser Trailer')
      )
      expect(criticalErrors).toHaveLength(0)
      
      // Não deve haver erros de tipo de registro não reconhecido
      // (mascara o mesmo bug que motivou a refatoração)
      const recordTypeErrors = result.errors.filter(e => 
        e.column === 'Tipo de registro' ||
        e.message.includes('não reconhecido') ||
        e.message.includes('não corresponde a nenhum tipo')
      )
      expect(recordTypeErrors).toHaveLength(0)
    })

    test('deve validar fixture real do Santander CNAB 400', () => {
      const fixturePath = join(__dirname, '../fixtures/cnab400/santander/SANTANDER_cnab_400_140.REM')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const lines = fileContent.split(/\r?\n/).filter(l => l.length > 0)
      const santander = getBankSchema('033', 'cnab400')!

      const result = validateCnab400Structure(lines, santander)

      expect(result.detailCount).toBeGreaterThan(0)
      
      const criticalErrors = result.errors.filter(e => 
        e.message.includes('Tamanho do registro') ||
        e.message.includes('deve ser Header') ||
        e.message.includes('deve ser Trailer')
      )
      expect(criticalErrors).toHaveLength(0)
    })

    test('deve validar fixture real do Sicredi CNAB 400', () => {
      const fixturePath = join(__dirname, '../fixtures/cnab400/sicredi/SICREDI_cnab_400.CRM')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const lines = fileContent.split(/\r?\n/).filter(l => l.length > 0)
      const sicredi = getBankSchema('748', 'cnab400')!

      const result = validateCnab400Structure(lines, sicredi)

      expect(result.detailCount).toBeGreaterThan(0)
      
      const criticalErrors = result.errors.filter(e => 
        e.message.includes('Tamanho do registro') ||
        e.message.includes('deve ser Header') ||
        e.message.includes('deve ser Trailer')
      )
      expect(criticalErrors).toHaveLength(0)
    })
  })

  describe('Cobertura de registros opcionais CNAB 400', () => {
    describe('Banco do Brasil - registros tipo 5', () => {
      test('deve reconhecer tipo 5 com tipo_servico 99 (multa)', () => {
        const bb = getBankSchema('001', 'cnab400')!
        const lines = [
          '0'.repeat(400), // Header
          '7'.repeat(400), // Detalhe tipo 7 (BB usa 7, não 1)
          '5' + '99' + '0'.repeat(397), // Tipo 5, serviço 99 (multa)
          '9'.repeat(400), // Trailer
        ]

        const result = validateCnab400Structure(lines, bb)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 5 com tipo_servico 07 (descontos 2 e 3)', () => {
        const bb = getBankSchema('001', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '7'.repeat(400),
          '5' + '07' + '0'.repeat(397), // Tipo 5, serviço 07 (descontos)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, bb)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 5 com tipo_servico 08 (agente negativador)', () => {
        const bb = getBankSchema('001', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '7'.repeat(400),
          '5' + '08' + '0'.repeat(397), // Tipo 5, serviço 08 (negativador)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, bb)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })
    })

    describe('Bradesco - registros tipo 2 e 6', () => {
      test('deve reconhecer tipo 2 (mensagens e descontos)', () => {
        const bradesco = getBankSchema('237', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '2'.repeat(400), // Tipo 2 (mensagens/descontos)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, bradesco)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 6 (transferência de carteira)', () => {
        const bradesco = getBankSchema('237', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '6'.repeat(400), // Tipo 6 (transferência)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, bradesco)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })
    })

    describe('Itaú - registros tipo 2, 4, 5 e 6 (variantes)', () => {
      test('deve reconhecer tipo 2 (multa)', () => {
        const itau = getBankSchema('341', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '2'.repeat(400), // Tipo 2 (multa)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, itau)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 4 (rateio de crédito)', () => {
        const itau = getBankSchema('341', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '4'.repeat(400), // Tipo 4 (rateio)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, itau)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 5 (e-mail sacador/avalista)', () => {
        const itau = getBankSchema('341', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '5'.repeat(400), // Tipo 5 (e-mail)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, itau)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 6 com codigo_layout 1 (dados do título)', () => {
        const itau = getBankSchema('341', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '6' + '1' + '0'.repeat(398), // Tipo 6, layout 1
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, itau)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 6 com codigo_layout 2 (instruções 1-5)', () => {
        const itau = getBankSchema('341', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '6' + '2' + '0'.repeat(398), // Tipo 6, layout 2
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, itau)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 6 com codigo_layout 3 (instruções 6-9)', () => {
        const itau = getBankSchema('341', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '6' + '3' + '0'.repeat(398), // Tipo 6, layout 3
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, itau)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 6 com codigo_layout 4 (sacador/avalista)', () => {
        const itau = getBankSchema('341', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '6' + '4' + '0'.repeat(398), // Tipo 6, layout 4
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, itau)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })
    })

    describe('Sicredi - registros tipo 2, 5, 6, 7, 8', () => {
      test('deve reconhecer tipo 2 (mensagem)', () => {
        const sicredi = getBankSchema('748', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '2'.repeat(400), // Tipo 2 (mensagem)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, sicredi)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 5 (informativo)', () => {
        const sicredi = getBankSchema('748', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '5'.repeat(400), // Tipo 5 (informativo)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, sicredi)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 6 (beneficiário final)', () => {
        const sicredi = getBankSchema('748', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '6'.repeat(400), // Tipo 6 (beneficiário final)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, sicredi)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 7 (descontos 2 e 3)', () => {
        const sicredi = getBankSchema('748', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '7'.repeat(400), // Tipo 7 (descontos)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, sicredi)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 8 (híbrido/QR Code)', () => {
        const sicredi = getBankSchema('748', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '8'.repeat(400), // Tipo 8 (híbrido)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, sicredi)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })
    })

    describe('Caixa - registros tipo 2, 3, 4', () => {
      test('deve reconhecer tipo 2 (mensagens do título)', () => {
        const caixa = getBankSchema('104', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '2'.repeat(400), // Tipo 2 (mensagens)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, caixa)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 3 (e-mail/SMS)', () => {
        const caixa = getBankSchema('104', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '3'.repeat(400), // Tipo 3 (e-mail/SMS)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, caixa)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })

      test('deve reconhecer tipo 4 (tipo de pagamento e rateio)', () => {
        const caixa = getBankSchema('104', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '4'.repeat(400), // Tipo 4 (pagamento/rateio)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, caixa)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })
    })

    describe('Santander - registro tipo 8', () => {
      test('deve reconhecer tipo 8 (PIX)', () => {
        const santander = getBankSchema('033', 'cnab400')!
        const lines = [
          '0'.repeat(400),
          '1'.repeat(400),
          '8'.repeat(400), // Tipo 8 (PIX)
          '9'.repeat(400),
        ]

        const result = validateCnab400Structure(lines, santander)

        const recordTypeErrors = result.errors.filter(e => 
          e.column === 'Tipo de registro' ||
          e.message.includes('não reconhecido')
        )
        expect(recordTypeErrors).toHaveLength(0)
      })
    })
  })

  describe('Casos de borda', () => {
    test('deve processar arquivo grande (muitos detalhes) sem problemas', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '0'.repeat(400),
        ...Array(1000).fill('1'.repeat(400)), // 1000 detalhes
        '9'.repeat(400),
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.detailCount).toBe(1000)
      expect(result.errors).toHaveLength(0)
    })

    test('deve acumular múltiplos erros em arquivo mal-formado', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = [
        '1'.repeat(400), // Erro: deveria ser Header
        '0'.repeat(400), // Erro: Header no meio
        '5'.repeat(400), // Erro: tipo desconhecido
        '1'.repeat(400), // OK
        '9'.repeat(400), // Erro: Trailer com tipo errado (na penúltima)
        '1'.repeat(400), // Erro: última linha deveria ser Trailer
      ]

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.errors.length).toBeGreaterThan(3)
    })

    test('deve retornar sem processar linhas quando guard inicial falha', () => {
      const bradesco = getBankSchema('237', 'cnab400')!
      const lines = ['X'] // Menos de 3 linhas

      const result = validateCnab400Structure(lines, bradesco)

      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toContain('no mínimo 3 registros')
      expect(result.detailCount).toBe(0)
    })

    test('deve retornar sem processar quando schema incompleto', () => {
      const incompleteSchema: BankSchema = {
        bankCode: '999',
        bankName: 'Teste',
        // Falta header, detail e trailer
      }

      const lines = ['0'.repeat(400), '1'.repeat(400), '9'.repeat(400)]

      const result = validateCnab400Structure(lines, incompleteSchema)

      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].column).toBe('Schema')
      expect(result.detailCount).toBe(0)
    })
  })
})
