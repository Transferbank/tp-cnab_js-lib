/**
 * Testes para mergeValidationErrors
 */

import { mergeValidationErrors } from '@validators/merge-validation-errors'
import { ValidationError } from '@tp-types/index'

describe('mergeValidationErrors', () => {
  test('deve retornar array vazio quando ambas as entradas são vazias', () => {
    const result = mergeValidationErrors([], [])
    
    expect(result).toEqual([])
  })

  test('deve retornar apenas erros estruturais quando não há erros de negócio', () => {
    const structural: ValidationError[] = [
      { line: 1, field: 'Header', message: 'Header ausente' },
      { line: 5, field: 'Trailer', message: 'Trailer incorreto' },
    ]
    
    const result = mergeValidationErrors(structural, [])
    
    expect(result).toEqual(structural)
  })

  test('deve retornar apenas erros de negócio quando não há erros estruturais', () => {
    const content: ValidationError[] = [
      { line: 3, field: 'CPF/CNPJ', message: 'Documento inválido' },
      { line: 4, field: 'Valor', message: 'Valor zerado' },
    ]
    
    const result = mergeValidationErrors([], content)
    
    expect(result).toEqual(content)
  })

  test('deve mesclar erros de linhas diferentes sem duplicatas', () => {
    const structural: ValidationError[] = [
      { line: 1, field: 'Header', message: 'Header ausente' },
      { line: 5, field: 'Tamanho do registro', message: 'Tamanho incorreto' },
    ]
    
    const content: ValidationError[] = [
      { line: 3, field: 'CPF/CNPJ', message: 'Documento inválido' },
      { line: 4, field: 'Valor', message: 'Valor zerado' },
    ]
    
    const result = mergeValidationErrors(structural, content)
    
    expect(result).toHaveLength(4)
    expect(result).toEqual([
      { line: 1, field: 'Header', message: 'Header ausente' },
      { line: 3, field: 'CPF/CNPJ', message: 'Documento inválido' },
      { line: 4, field: 'Valor', message: 'Valor zerado' },
      { line: 5, field: 'Tamanho do registro', message: 'Tamanho incorreto' },
    ])
  })

  test('deve remover duplicatas quando ambas reportam mesma (linha, coluna)', () => {
    const structural: ValidationError[] = [
      { line: 3, field: 'Trailer', message: 'Trailer com tipo incorreto (estrutural)' },
    ]
    
    const content: ValidationError[] = [
      { line: 3, field: 'Trailer', message: 'Trailer deve ser tipo 9 (negócio)' },
    ]
    
    const result = mergeValidationErrors(structural, content)
    
    // Deve ter apenas 1 erro (estrutural prevalece)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual(structural[0])
  })

  test('deve preservar erros de mesma linha mas colunas diferentes', () => {
    const structural: ValidationError[] = [
      { line: 3, field: 'Tamanho do registro', message: 'Tamanho incorreto' },
    ]
    
    const content: ValidationError[] = [
      { line: 3, field: 'CPF/CNPJ', message: 'Documento inválido' },
    ]
    
    const result = mergeValidationErrors(structural, content)
    
    // Ambos devem estar presentes (colunas diferentes)
    expect(result).toHaveLength(2)
    expect(result).toContainEqual(structural[0])
    expect(result).toContainEqual(content[0])
  })

  test('deve ordenar resultado por número de linha', () => {
    const structural: ValidationError[] = [
      { line: 5, field: 'Header', message: 'Erro na linha 5' },
      { line: 2, field: 'Tamanho', message: 'Erro na linha 2' },
    ]
    
    const content: ValidationError[] = [
      { line: 7, field: 'CPF', message: 'Erro na linha 7' },
      { line: 3, field: 'Valor', message: 'Erro na linha 3' },
    ]
    
    const result = mergeValidationErrors(structural, content)
    
    expect(result).toHaveLength(4)
    expect(result[0].line).toBe(2)
    expect(result[1].line).toBe(3)
    expect(result[2].line).toBe(5)
    expect(result[3].line).toBe(7)
  })

  test('deve lidar com múltiplas duplicatas', () => {
    const structural: ValidationError[] = [
      { line: 1, field: 'Header', message: 'Header estrutural' },
      { line: 3, field: 'Trailer', message: 'Trailer estrutural' },
      { line: 5, field: 'Tamanho', message: 'Tamanho estrutural' },
    ]
    
    const content: ValidationError[] = [
      { line: 1, field: 'Header', message: 'Header negócio' }, // Duplicata
      { line: 2, field: 'CPF', message: 'CPF inválido' },
      { line: 3, field: 'Trailer', message: 'Trailer negócio' }, // Duplicata
      { line: 4, field: 'Nome', message: 'Nome vazio' },
    ]
    
    const result = mergeValidationErrors(structural, content)
    
    // Deve ter 5 erros únicos (3 estruturais + 2 de negócio não duplicados)
    expect(result).toHaveLength(5)
    
    // Duplicatas devem usar versão estrutural
    const line1 = result.find(e => e.line === 1)
    expect(line1?.message).toBe('Header estrutural')
    
    const line3 = result.find(e => e.line === 3)
    expect(line3?.message).toBe('Trailer estrutural')
  })

  test('deve preservar todas as propriedades do ValidationError', () => {
    const structural: ValidationError[] = [
      { line: 1, field: 'Campo A', message: 'Erro estrutural' },
    ]
    
    const content: ValidationError[] = [
      { line: 2, field: 'Campo B', message: 'Erro de negócio' },
    ]
    
    const result = mergeValidationErrors(structural, content)
    
    result.forEach(error => {
      expect(error).toHaveProperty('line')
      expect(error).toHaveProperty('field')
      expect(error).toHaveProperty('message')
      expect(typeof error.line).toBe('number')
      expect(typeof error.field).toBe('string')
      expect(typeof error.message).toBe('string')
    })
  })
})
