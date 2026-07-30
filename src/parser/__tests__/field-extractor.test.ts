/**
 * Testes do field-extractor
 * 
 * Testa funções auxiliares de extração de campos CNAB.
 */

import { getRecordTypePattern } from '@parser/field-extractor'
import { RecordSchema, FieldType } from '@tp-types/index'

describe('getRecordTypePattern', () => {
  describe('CNAB 400 (posição 1)', () => {
    test('deve encontrar pattern quando campo se chama tipo_registro', () => {
      const schema: RecordSchema = {
        tipo_registro: {
          pos: [1, 1],
          type: FieldType.ALFA,
          size: 1,
          decimals: 0,
          required: true,
          dateFormat: null,
          pattern: '7',
          description: 'Tipo de registro', canonical: null },
        outro_campo: {
          pos: [2, 10],
          type: FieldType.ALFA,
          size: 9,
          decimals: 0,
          required: false,
          dateFormat: null,
          pattern: null,
          description: 'Outro campo', canonical: null },
      }

      const result = getRecordTypePattern(schema, 1)
      expect(result).toBe('7')
    })

    test('deve encontrar pattern quando campo se chama codigo_registro (Caixa)', () => {
      const schema: RecordSchema = {
        codigo_registro: {
          pos: [1, 1],
          type: FieldType.ALFA,
          size: 1,
          decimals: 0,
          required: true,
          dateFormat: null,
          pattern: '1',
          description: 'Código de registro', canonical: null },
        outro_campo: {
          pos: [2, 10],
          type: FieldType.ALFA,
          size: 9,
          decimals: 0,
          required: false,
          dateFormat: null,
          pattern: null,
          description: 'Outro campo', canonical: null },
      }

      const result = getRecordTypePattern(schema, 1)
      expect(result).toBe('1')
    })

    test('deve retornar null quando schema é undefined', () => {
      const result = getRecordTypePattern(undefined, 1)
      expect(result).toBeNull()
    })

    test('deve retornar null quando nenhum campo está na posição 1', () => {
      const schema: RecordSchema = {
        campo_qualquer: {
          pos: [2, 10],
          type: FieldType.ALFA,
          size: 9,
          decimals: 0,
          required: false,
          dateFormat: null,
          pattern: null,
          description: 'Campo qualquer', canonical: null },
      }

      const result = getRecordTypePattern(schema, 1)
      expect(result).toBeNull()
    })

    test('deve retornar null quando campo na posição 1 não tem pattern', () => {
      const schema: RecordSchema = {
        tipo_registro: {
          pos: [1, 1],
          type: FieldType.ALFA,
          size: 1,
          decimals: 0,
          required: false,
          dateFormat: null,
          pattern: null,
          description: 'Tipo de registro', canonical: null },
      }

      const result = getRecordTypePattern(schema, 1)
      expect(result).toBeNull()
    })
  })

  describe('CNAB 240 (posição 8)', () => {
    test('deve encontrar pattern quando campo se chama controle_registro (padrão CNAB 240)', () => {
      const schema: RecordSchema = {
        outros_campos: {
          pos: [1, 7],
          type: FieldType.ALFA,
          size: 7,
          decimals: 0,
          required: false,
          dateFormat: null,
          pattern: null,
          description: 'Outros campos', canonical: null },
        controle_registro: {
          pos: [8, 8],
          type: FieldType.ALFA,
          size: 1,
          decimals: 0,
          required: true,
          dateFormat: null,
          pattern: '9',
          description: 'Controle de registro', canonical: null },
      }

      const result = getRecordTypePattern(schema, 8)
      expect(result).toBe('9')
    })

    test('deve encontrar pattern independente do nome do campo', () => {
      const schema: RecordSchema = {
        campo_x: {
          pos: [1, 7],
          type: FieldType.ALFA,
          size: 7,
          decimals: 0,
          required: false,
          dateFormat: null,
          pattern: null,
          description: 'Campo X', canonical: null },
        nome_customizado: {
          pos: [8, 8],
          type: FieldType.NUM,
          size: 1,
          decimals: 0,
          required: true,
          dateFormat: null,
          pattern: 3,
          description: 'Campo com nome customizado na posição 8', canonical: null },
      }

      const result = getRecordTypePattern(schema, 8)
      expect(result).toBe(3)
    })

    test('deve retornar null quando nenhum campo está na posição 8', () => {
      const schema: RecordSchema = {
        campo_qualquer: {
          pos: [1, 7],
          type: FieldType.ALFA,
          size: 7,
          decimals: 0,
          required: false,
          dateFormat: null,
          pattern: null,
          description: 'Campo qualquer', canonical: null },
      }

      const result = getRecordTypePattern(schema, 8)
      expect(result).toBeNull()
    })
  })

  describe('Pattern pode ser string ou number', () => {
    test('deve retornar string pattern', () => {
      const schema: RecordSchema = {
        tipo: {
          pos: [1, 1],
          type: FieldType.ALFA,
          size: 1,
          decimals: 0,
          required: true,
          dateFormat: null,
          pattern: 'X',
          description: 'Tipo', canonical: null },
      }

      const result = getRecordTypePattern(schema, 1)
      expect(result).toBe('X')
    })

    test('deve retornar number pattern', () => {
      const schema: RecordSchema = {
        tipo: {
          pos: [8, 8],
          type: FieldType.NUM,
          size: 1,
          decimals: 0,
          required: true,
          dateFormat: null,
          pattern: 5,
          description: 'Tipo', canonical: null },
      }

      const result = getRecordTypePattern(schema, 8)
      expect(result).toBe(5)
    })
  })
})
