/**
 * Testes do validador de negócio CNAB 400
 * 
 * Testa comportamentos específicos do validateCnab400Content que não são
 * cobertos pelos testes de bancos específicos.
 */

import { validateCnab400Content } from '@validators/cnab400-content-validator'
import { BankSchema } from '@tp-types/index'
import { FieldType, DateFormat } from '@tp-types/index'

describe('validateCnab400Content', () => {
  describe('Erros de campo no header (um erro por campo do schema, sem duplicação)', () => {
    test('deve reportar um único erro quando o tipo do header está errado', () => {
      const customSchema: BankSchema = {
        bankCode: '999',
        bankName: 'Banco Teste',
        header: {
          tipo_registro: {
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '0',
            description: 'Tipo de registro', canonical: null },
        },
        detail: {
          tipo_registro: {
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '1',
            description: 'Tipo de registro', canonical: null },
          nome: {
            pos: [235, 274],
            type: FieldType.ALFA,
            size: 40,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Nome do sacado', canonical: null },
          sacado_numero_inscricao: {
            pos: [221, 234],
            type: FieldType.NUM,
            size: 14,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Número de inscrição do sacado', canonical: null },
          valor_titulo: {
            pos: [127, 139],
            type: FieldType.NUM,
            size: 13,
            decimals: 2,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Valor do título', canonical: null },
          vencimento: {
            pos: [121, 126],
            type: FieldType.DATA,
            size: 6,
            decimals: 0,
            required: true,
            dateFormat: DateFormat.DDMMAA,
            pattern: null,
            description: 'Data de vencimento', canonical: null },
        },
        trailer: {
          tipo_registro: {
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '9',
            description: 'Tipo de registro', canonical: null },
        },
      }

      // Header com tipo errado '1' em vez de '0'
      const header = '1' + ' '.repeat(399)
      const detail = '1' + ' '.repeat(234 - 1) + '00012345678909' + ' '.repeat(385)
      const trailer = '9' + ' '.repeat(399)

      const result = validateCnab400Content([header, detail, trailer], customSchema)

      // Deve ter exatamente 1 erro para o header (campo tipo_registro), sem duplicação
      const headerErrors = result.errors.filter(e => e.line === 1)
      expect(headerErrors).toHaveLength(1)
      expect(headerErrors[0]).toEqual(
        expect.objectContaining({
          line: 1,
          field: 'tipo_registro',
          message: 'Esperado "0", encontrado "1"',
        })
      )
    })

    test('deve reportar erro de tipo E outros erros de campo no mesmo header', () => {
      const customSchema: BankSchema = {
        bankCode: '999',
        bankName: 'Banco Teste',
        header: {
          tipo_registro: {
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '0',
            description: 'Tipo de registro', canonical: null },
          literal_remessa: {
            pos: [2, 8],
            type: FieldType.ALFA,
            size: 7,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: 'REMESSA', // Padrão fixo esperado
            description: 'Literal REMESSA', canonical: null },
        },
        detail: {
          tipo_registro: {
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '1',
            description: 'Tipo de registro', canonical: null },
          nome: {
            pos: [235, 274],
            type: FieldType.ALFA,
            size: 40,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Nome do sacado', canonical: null },
          sacado_numero_inscricao: {
            pos: [221, 234],
            type: FieldType.NUM,
            size: 14,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Número de inscrição do sacado', canonical: null },
          valor_titulo: {
            pos: [127, 139],
            type: FieldType.NUM,
            size: 13,
            decimals: 2,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Valor do título', canonical: null },
          vencimento: {
            pos: [121, 126],
            type: FieldType.DATA,
            size: 6,
            decimals: 0,
            required: true,
            dateFormat: DateFormat.DDMMAA,
            pattern: null,
            description: 'Data de vencimento', canonical: null },
        },
        trailer: {
          tipo_registro: {
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '9',
            description: 'Tipo de registro', canonical: null },
        },
      }

      // Header com tipo errado '1' E literal errado 'RETORNO'
      const header = '1' + 'RETORNO' + ' '.repeat(392)
      const detail = '1' + ' '.repeat(234 - 1) + '00012345678909' + ' '.repeat(385)
      const trailer = '9' + ' '.repeat(399)

      const result = validateCnab400Content([header, detail, trailer], customSchema)

      // Deve ter exatamente 2 erros no header (um por campo inválido, sem duplicação)
      const headerErrors = result.errors.filter(e => e.line === 1)
      expect(headerErrors).toHaveLength(2)

      // Um erro para o campo tipo_registro
      expect(headerErrors).toContainEqual(
        expect.objectContaining({
          line: 1,
          field: 'tipo_registro',
          message: 'Esperado "0", encontrado "1"',
        })
      )

      // Um erro para o campo literal_remessa
      expect(headerErrors).toContainEqual(
        expect.objectContaining({
          line: 1,
          field: 'literal_remessa',
          message: 'Esperado "REMESSA", encontrado "RETORNO"',
        })
      )
    })
  })

  describe('Leitura de tipo de registro por posição (não por nome) - Header', () => {
    test('deve aceitar header com campo codigo_registro em vez de tipo_registro', () => {
      // Caso real: Caixa CNAB 400 usa codigo_registro, não tipo_registro
      // Este teste prova que a leitura agora é por posição (1), não por nome do campo
      const customSchema: BankSchema = {
        bankCode: '104',
        bankName: 'Caixa',
        header: {
          codigo_registro: {  // Nome diferente!
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '0',
            description: 'Código de registro', canonical: null },
        },
        detail: {
          codigo_registro: {  // Nome diferente!
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '1',
            description: 'Código de registro', canonical: null },
          nome: {
            pos: [235, 274],
            type: FieldType.ALFA,
            size: 40,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Nome do sacado', canonical: null },
          sacado_numero_inscricao: {
            pos: [221, 234],
            type: FieldType.NUM,
            size: 14,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Número de inscrição do sacado', canonical: null },
          valor_titulo: {
            pos: [127, 139],
            type: FieldType.NUM,
            size: 13,
            decimals: 2,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Valor do título', canonical: null },
          vencimento: {
            pos: [121, 126],
            type: FieldType.DATA,
            size: 6,
            decimals: 0,
            required: true,
            dateFormat: DateFormat.DDMMAA,
            pattern: null,
            description: 'Data de vencimento', canonical: null },
        },
        trailer: {
          codigo_registro: {  // Nome diferente!
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '9',
            description: 'Código de registro', canonical: null },
        },
      }

      const header = '0' + ' '.repeat(399)
      const detail = '1' + ' '.repeat(234 - 1) + '00012345678909' + ' '.repeat(385)
      const trailer = '9' + ' '.repeat(399)

      const result = validateCnab400Content([header, detail, trailer], customSchema)

      // Não deve ter erro de tipo de header (header é válido)
      const headerErrors = result.errors.filter(e => e.line === 1)
      expect(headerErrors).toHaveLength(0)
    })

    test('deve rejeitar header com tipo errado mesmo quando campo tem nome não-padrão', () => {
      const customSchema: BankSchema = {
        bankCode: '104',
        bankName: 'Caixa',
        header: {
          codigo_registro: {
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '0',
            description: 'Código de registro', canonical: null },
        },
        detail: {
          codigo_registro: {
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '1',
            description: 'Código de registro', canonical: null },
          nome: {
            pos: [235, 274],
            type: FieldType.ALFA,
            size: 40,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Nome do sacado', canonical: null },
          sacado_numero_inscricao: {
            pos: [221, 234],
            type: FieldType.NUM,
            size: 14,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Número de inscrição do sacado', canonical: null },
          valor_titulo: {
            pos: [127, 139],
            type: FieldType.NUM,
            size: 13,
            decimals: 2,
            required: true,
            dateFormat: null,
            pattern: null,
            description: 'Valor do título', canonical: null },
          vencimento: {
            pos: [121, 126],
            type: FieldType.DATA,
            size: 6,
            decimals: 0,
            required: true,
            dateFormat: DateFormat.DDMMAA,
            pattern: null,
            description: 'Data de vencimento', canonical: null },
        },
        trailer: {
          codigo_registro: {
            pos: [1, 1],
            type: FieldType.ALFA,
            size: 1,
            decimals: 0,
            required: true,
            dateFormat: null,
            pattern: '9',
            description: 'Código de registro', canonical: null },
        },
      }

      const header = '1' + ' '.repeat(399) // Tipo '1' errado (deveria ser '0')
      const detail = '1' + ' '.repeat(234 - 1) + '00012345678909' + ' '.repeat(385)
      const trailer = '9' + ' '.repeat(399)

      const result = validateCnab400Content([header, detail, trailer], customSchema)

      // Deve ter erro de tipo de header, usando o nome do campo do schema (codigo_registro),
      // provando que a leitura do tipo é por posição (1), não por nome fixo do campo
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 1,
          field: 'codigo_registro',
          message: 'Esperado "0", encontrado "1"',
        })
      )
    })
  })
})

