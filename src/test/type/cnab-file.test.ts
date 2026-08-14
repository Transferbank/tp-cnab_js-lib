import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { resPath } from '@test/conftest'
import { readExampleLines } from '@test/test-utils'
import { CnabBank } from '@cnab/type/cnab-bank'
import { CnabFile } from '@cnab/type/cnab-file'
import { CnabFormat } from '@cnab/type/cnab-format'
import {
  CnabMinimumLinesNotReachedException,
  CnabFormatNotRecognizedException,
  CnabBankCodeNotFoundException
} from '@cnab/exception/cnab-exception'

describe('CnabFile.fromLines', () => {
  describe('Bradesco CNAB400', () => {
    it('dado arquivo válido quando criar fromLines então detecta formato banco e schema', () => {
      // Given
      const rawLines = readExampleLines(path.join(resPath(), 'bradesco/cnab400/bradesco_cnab_400.txt'))
      
      // When
      const cnabFile = CnabFile.fromLines(rawLines)
      
      // Then
      expect(cnabFile.format).toBe(CnabFormat.CNAB400)
      expect(cnabFile.bank).toBe(CnabBank.BRADESCO)
      expect(cnabFile.schema).toBeDefined()
      expect(cnabFile.rawLines).toEqual(rawLines)
      expect(cnabFile.schema.header.fmt).toBe(CnabFormat.CNAB400)
      expect(cnabFile.schema.header.bank).toBe(CnabBank.BRADESCO)
      expect(cnabFile.schema.boleto.fields.length).toBeGreaterThan(0)
      expect(cnabFile.schema.boleto.validators.length).toBeGreaterThan(0)
    })
  })

  describe('Bradesco CNAB240', () => {
    it('dado arquivo válido quando criar fromLines então detecta formato banco e schema', () => {
      // Given
      const rawLines = readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt'))
      
      // When
      const cnabFile = CnabFile.fromLines(rawLines)
      
      // Then
      expect(cnabFile.format).toBe(CnabFormat.CNAB240)
      expect(cnabFile.bank).toBe(CnabBank.BRADESCO)
      expect(cnabFile.schema).toBeDefined()
      expect(cnabFile.rawLines).toEqual(rawLines)
      expect(cnabFile.schema.header.fmt).toBe(CnabFormat.CNAB240)
      expect(cnabFile.schema.header.bank).toBe(CnabBank.BRADESCO)
    })
  })

  describe('Validação de linhas mínimas', () => {
    it('dado menos de 3 linhas quando criar fromLines então lança exceção', () => {
      // Given
      const rawLines = ['linha1', 'linha2']
      
      // When / Then
      expect(() => CnabFile.fromLines(rawLines)).toThrow(CnabMinimumLinesNotReachedException)
    })
  })

  describe('Validação de formato', () => {
    it('dado header com tamanho inválido quando criar fromLines então lança exceção', () => {
      // Given
      const rawLines = readExampleLines(path.join(resPath(), 'bradesco/cnab400/bradesco_cnab_400.txt'))
      const invalidLines = [
        rawLines[0].substring(0, 300),
        rawLines[1],
        rawLines[2]
      ]
      
      // When / Then
      expect(() => CnabFile.fromLines(invalidLines)).toThrow(CnabFormatNotRecognizedException)
    })
  })

  describe('Validação de código do banco', () => {
    it('dado código de banco inválido em CNAB400 quando criar fromLines então lança exceção', () => {
      // Given
      const rawLines = readExampleLines(path.join(resPath(), 'bradesco/cnab400/bradesco_cnab_400.txt'))
      const invalidLines = [
        rawLines[0].substring(0, 76) + '999' + rawLines[0].substring(79),
        rawLines[1],
        rawLines[2]
      ]
      
      // When / Then
      expect(() => CnabFile.fromLines(invalidLines)).toThrow(CnabBankCodeNotFoundException)
    })

    it('dado código de banco inválido em CNAB240 quando criar fromLines então lança exceção', () => {
      // Given
      const rawLines = readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt'))
      const invalidLines = [
        '999' + rawLines[0].substring(3),
        rawLines[1],
        rawLines[2]
      ]
      
      // When / Then
      expect(() => CnabFile.fromLines(invalidLines)).toThrow(CnabBankCodeNotFoundException)
    })
  })
})
