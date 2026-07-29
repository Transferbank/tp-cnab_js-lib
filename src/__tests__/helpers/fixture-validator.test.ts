/**
 * Testes para o validador de integridade de fixtures
 */

import { validateFixtureIntegrity } from './fixture-validator'
import { loadFixtureMetadata } from './fixture-metadata'
import { bradescoCnab240 } from '@banks/bradesco/schemas/cnab240'
import * as fs from 'fs'
import * as path from 'path'

describe('Validador: validateFixtureIntegrity', () => {
  const FIXTURES_DIR = path.join(__dirname, '../../banks/bradesco/__fixtures__/cnab240')

  /**
   * Helper para ler fixture TXT
   */
  function readFixture(filename: string): string[] {
    const filePath = path.join(FIXTURES_DIR, filename)
    const content = fs.readFileSync(filePath, 'latin1')
    return content.split(/\r?\n/).filter(line => line.length > 0)
  }

  describe('Validação com fixture real do Bradesco', () => {
    test('deve validar fixture real sem erros', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)

      expect(errors).toEqual([])
    })

    test('deve ter todas as linhas com 240 caracteres', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Todas as linhas devem ter 240 caracteres
      lines.forEach(line => {
        expect(line.length).toBe(240)
      })

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)
      expect(errors).toEqual([])
    })
  })

  describe('Detecção de inconsistências', () => {
    test('deve detectar número incorreto de linhas', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Remover uma linha
      const modifiedLines = lines.slice(0, -1)

      const errors = validateFixtureIntegrity(modifiedLines, metadata, bradescoCnab240)

      expect(errors).toHaveLength(1)
      expect(errors[0].type).toBe('line-count')
      expect(errors[0].field).toBe('totalLines')
      expect(errors[0].expected).toBe(metadata.structure.totalLines)
      expect(errors[0].actual).toBe(metadata.structure.totalLines - 1)
    })

    test('deve detectar linha com tamanho incorreto', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Modificar uma linha para ter tamanho errado
      const modifiedLines = [...lines]
      modifiedLines[1] = modifiedLines[1].substring(0, 200) // Encurtar linha

      const errors = validateFixtureIntegrity(modifiedLines, metadata, bradescoCnab240)

      expect(errors.length).toBeGreaterThan(0)
      const lineLengthError = errors.find(e => e.type === 'line-count' && e.field === 'lineLength')
      expect(lineLengthError).toBeDefined()
      expect(lineLengthError?.expected).toBe(240)
      expect(lineLengthError?.actual).toBe(200)
    })

    test('deve detectar código do banco incorreto', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Modificar código do banco no header (posições 1-3)
      const modifiedLines = [...lines]
      modifiedLines[0] = '033' + modifiedLines[0].substring(3) // Trocar 237 por 033

      const errors = validateFixtureIntegrity(modifiedLines, metadata, bradescoCnab240)

      const bankCodeError = errors.find(e => e.type === 'bank-code')
      expect(bankCodeError).toBeDefined()
      expect(bankCodeError?.expected).toBe('237')
      expect(bankCodeError?.actual).toBe('033')
    })
  })

  describe('Validação de totalizadores', () => {
    test('deve detectar soma de valores incorreta nos metadados', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Modificar total nos metadados
      const modifiedMetadata = {
        ...metadata,
        totals: {
          ...metadata.totals,
          totalAmount: 999.00 // Valor errado
        }
      }

      const errors = validateFixtureIntegrity(lines, modifiedMetadata, bradescoCnab240)

      const totalError = errors.find(e => e.field === 'totals.totalAmount')
      expect(totalError).toBeDefined()
      expect(totalError?.expected).toBe(999.00)
      expect(totalError?.actual).toBe(metadata.totals.totalAmount)
    })

    test('deve detectar contagem de registros incorreta', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Modificar contagem nos metadados
      const modifiedMetadata = {
        ...metadata,
        totals: {
          ...metadata.totals,
          recordCount: 5 // Valor errado
        }
      }

      const errors = validateFixtureIntegrity(lines, modifiedMetadata, bradescoCnab240)

      const countError = errors.find(e => e.field === 'totals.recordCount')
      expect(countError).toBeDefined()
      expect(countError?.expected).toBe(5)
      expect(countError?.actual).toBe(metadata.totals.recordCount)
    })
  })

  describe('Validação de campos individuais', () => {
    test('deve validar corretamente todos os títulos', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)

      // Sem erros = todos os 3 títulos validados com sucesso
      expect(errors).toEqual([])
    })

    test('deve validar valores dos 3 títulos', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Valores esperados
      expect(metadata.records[0].amount).toBe(100.00)
      expect(metadata.records[1].amount).toBe(250.00)
      expect(metadata.records[2].amount).toBe(500.00)

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)
      expect(errors).toEqual([])
    })

    test('deve validar documentos dos 3 títulos', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Documentos esperados
      expect(metadata.records[0].document).toBe('10000791989')
      expect(metadata.records[1].document).toBe('10001583816')
      expect(metadata.records[2].document).toBe('60000001994627')

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)
      expect(errors).toEqual([])
    })

    test('deve validar datas de vencimento dos 3 títulos', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Datas esperadas
      expect(metadata.records[0].dueDate).toBe('15/12/2026')
      expect(metadata.records[1].dueDate).toBe('20/12/2026')
      expect(metadata.records[2].dueDate).toBe('31/12/2026')

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)
      expect(errors).toEqual([])
    })
  })

  describe('Validação de campos raw', () => {
    test('deve validar amountRaw dos títulos', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Valores raw esperados
      expect(metadata.records[0].amountRaw).toBe('000000000010000')
      expect(metadata.records[1].amountRaw).toBe('000000000025000')
      expect(metadata.records[2].amountRaw).toBe('000000000050000')

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)
      expect(errors).toEqual([])
    })

    test('deve validar dueDateRaw dos títulos', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Datas raw esperadas
      expect(metadata.records[0].dueDateRaw).toBe('15122026')
      expect(metadata.records[1].dueDateRaw).toBe('20122026')
      expect(metadata.records[2].dueDateRaw).toBe('31122026')

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)
      expect(errors).toEqual([])
    })

    test('deve validar documentRaw dos títulos', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Documentos raw esperados
      expect(metadata.records[0].documentRaw).toBe('000010000791989')
      expect(metadata.records[1].documentRaw).toBe('000010001583816')
      expect(metadata.records[2].documentRaw).toBe('060000001994627')

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)
      expect(errors).toEqual([])
    })

    test('deve validar documentTypeCode dos títulos', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Tipos esperados
      expect(metadata.records[0].documentTypeCode).toBe('1') // CPF
      expect(metadata.records[1].documentTypeCode).toBe('1') // CPF
      expect(metadata.records[2].documentTypeCode).toBe('2') // CNPJ

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)
      expect(errors).toEqual([])
    })
  })

  describe('Validação do header', () => {
    test('deve validar dataGeracaoRaw do header', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      expect(metadata.header?.dataGeracaoRaw).toBe('01072026')

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)
      expect(errors).toEqual([])
    })

    test('deve validar cedenteNome do header', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      expect(metadata.header?.cedenteNome).toBe('EMPRESA EXEMPLO LTDA')

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)
      expect(errors).toEqual([])
    })
  })

  describe('Retorno de erros', () => {
    test('deve retornar array vazio quando tudo está correto', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      const errors = validateFixtureIntegrity(lines, metadata, bradescoCnab240)

      expect(Array.isArray(errors)).toBe(true)
      expect(errors.length).toBe(0)
    })

    test('deve retornar erros com estrutura correta', () => {
      const lines = readFixture('remessa-multipla.txt')
      const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla')

      // Modificar para forçar erro
      const modifiedLines = lines.slice(0, -1)

      const errors = validateFixtureIntegrity(modifiedLines, metadata, bradescoCnab240)

      expect(errors.length).toBeGreaterThan(0)
      errors.forEach(error => {
        expect(error).toHaveProperty('type')
        expect(error).toHaveProperty('message')
        expect(typeof error.message).toBe('string')
      })
    })
  })
})
