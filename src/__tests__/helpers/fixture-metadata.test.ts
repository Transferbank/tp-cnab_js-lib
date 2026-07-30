/**
 * Testes para o helper de metadados de fixtures
 */

import * as fs from 'fs'
import * as path from 'path'
import { loadFixtureMetadata } from './fixture-metadata'
import { FixtureMetadata } from '@tp-types/testing'
import { CNABFormatCode } from '@tp-types/index'

describe('Helper: loadFixtureMetadata', () => {
  const BASE_DIR = path.join(__dirname, '__fixtures-tmp__')
  const FIXTURES_DIR = path.join(BASE_DIR, 'test-helper', '__fixtures__', CNABFormatCode.CNAB240)

  beforeAll(() => {
    if (!fs.existsSync(FIXTURES_DIR)) {
      fs.mkdirSync(FIXTURES_DIR, { recursive: true })
    }
  })

  afterAll(() => {
    fs.rmSync(BASE_DIR, { recursive: true, force: true })
  })

  function load(fixtureName: string, format: CNABFormatCode.CNAB240 | CNABFormatCode.CNAB400 = CNABFormatCode.CNAB240): FixtureMetadata {
    return loadFixtureMetadata('test-helper', fixtureName, format, BASE_DIR)
  }

  describe('Validação de arquivo', () => {
    test('deve lançar erro se arquivo JSON não existe', () => {
      expect(() => {
        load('nao-existe')
      }).toThrow(/Arquivo de metadados não encontrado/)
    })

    test('deve lançar erro se JSON é inválido', () => {
      const invalidJsonPath = path.join(FIXTURES_DIR, 'invalid.json')
      fs.writeFileSync(invalidJsonPath, '{ invalid json }', 'utf8')

      expect(() => {
        load('invalid')
      }).toThrow(/JSON inválido/)
    })

    test('deve lançar erro se arquivo não é um objeto', () => {
      const arrayJsonPath = path.join(FIXTURES_DIR, 'array.json')
      fs.writeFileSync(arrayJsonPath, '[]', 'utf8')

      expect(() => {
        load('array')
      }).toThrow(/Esperado: objeto JSON/)
    })
  })

  describe('Validação de campos obrigatórios', () => {
    test('deve lançar erro se campo "description" ausente', () => {
      const metadata = createMinimalMetadata()
      delete (metadata as any).description
      writeMetadata('no-description', metadata)

      expect(() => {
        load('no-description')
      }).toThrow(/Campo obrigatório ausente: "description"/)
    })

    test('deve lançar erro se campo "bankCode" ausente', () => {
      const metadata = createMinimalMetadata()
      delete (metadata as any).bankCode
      writeMetadata('no-bankcode', metadata)

      expect(() => {
        load('no-bankcode')
      }).toThrow(/Campo obrigatório ausente: "bankCode"/)
    })

    test('deve lançar erro se campo "format" tem valor inválido', () => {
      const metadata = createMinimalMetadata()
      ;(metadata as any).format = 'CNAB300' // inválido
      writeMetadata('invalid-format', metadata)

      expect(() => {
        load('invalid-format')
      }).toThrow(/Campo "format" inválido/)
    })

    test('deve lançar erro se campo "records" está vazio', () => {
      const metadata = createMinimalMetadata()
      metadata.records = []
      writeMetadata('empty-records', metadata)

      expect(() => {
        load('empty-records')
      }).toThrow(/Campo "records" não pode ser vazio/)
    })
  })

  describe('Validação de structure', () => {
    test('deve lançar erro se structure.totalLines ausente', () => {
      const metadata = createMinimalMetadata()
      delete (metadata.structure as any).totalLines
      writeMetadata('no-totallines', metadata)

      expect(() => {
        load('no-totallines')
      }).toThrow(/Campo obrigatório ausente: "totalLines"/)
    })

    test('deve lançar erro se structure.totalLines é negativo', () => {
      const metadata = createMinimalMetadata()
      metadata.structure.totalLines = -5
      writeMetadata('negative-totallines', metadata)

      expect(() => {
        load('negative-totallines')
      }).toThrow(/deve ser um inteiro não-negativo/)
    })
  })

  describe('Validação de records', () => {
    test('deve lançar erro se record.documentType inválido', () => {
      const metadata = createMinimalMetadata()
      ;(metadata.records[0] as any).documentType = 'INVALIDO'
      writeMetadata('invalid-doctype', metadata)

      expect(() => {
        load('invalid-doctype')
      }).toThrow(/Campo "documentType" inválido/)
    })

    test('deve lançar erro se record.amount é negativo', () => {
      const metadata = createMinimalMetadata()
      metadata.records[0].amount = -100
      writeMetadata('negative-amount', metadata)

      expect(() => {
        load('negative-amount')
      }).toThrow(/Campo "amount" deve ser não-negativo/)
    })

    test('deve lançar erro se record.name ausente', () => {
      const metadata = createMinimalMetadata()
      delete (metadata.records[0] as any).name
      writeMetadata('no-name', metadata)

      expect(() => {
        load('no-name')
      }).toThrow(/Campo obrigatório ausente: "name"/)
    })
  })

  describe('Validação de totals', () => {
    test('deve lançar erro se totals.recordCount negativo', () => {
      const metadata = createMinimalMetadata()
      metadata.totals.recordCount = -1
      writeMetadata('negative-recordcount', metadata)

      expect(() => {
        load('negative-recordcount')
      }).toThrow(/deve ser não-negativo/)
    })

    test('deve lançar erro se totals.totalAmount negativo', () => {
      const metadata = createMinimalMetadata()
      metadata.totals.totalAmount = -100
      writeMetadata('negative-totalamount', metadata)

      expect(() => {
        load('negative-totalamount')
      }).toThrow(/deve ser não-negativo/)
    })
  })

  describe('Carregamento bem-sucedido', () => {
    test('deve carregar metadados válidos sem erros', () => {
      const metadata = createMinimalMetadata()
      writeMetadata('valid', metadata)

      const loaded = load('valid')

      expect(loaded.description).toBe(metadata.description)
      expect(loaded.bankCode).toBe(metadata.bankCode)
      expect(loaded.format).toBe(metadata.format)
      expect(loaded.records).toHaveLength(1)
    })

    test('deve carregar metadados com header opcional', () => {
      const metadata = createMinimalMetadata()
      metadata.header = {
        cedenteNome: 'EMPRESA TESTE',
        dataGeracao: '03/07/2026',
        dataGeracaoRaw: '03072026'
      }
      writeMetadata('with-header', metadata)

      const loaded = load('with-header')

      expect(loaded.header).toBeDefined()
      expect(loaded.header!.cedenteNome).toBe('EMPRESA TESTE')
      expect(loaded.header!.dataGeracaoRaw).toBe('03072026')
    })

    test('deve carregar metadados com campos raw opcionais', () => {
      const metadata = createMinimalMetadata()
      metadata.records[0].documentRaw = '000011144477735'
      metadata.records[0].amountRaw = '000000000010000'
      metadata.records[0].dueDateRaw = '15122026'
      writeMetadata('with-raw', metadata)

      const loaded = load('with-raw')

      expect(loaded.records[0].documentRaw).toBe('000011144477735')
      expect(loaded.records[0].amountRaw).toBe('000000000010000')
      expect(loaded.records[0].dueDateRaw).toBe('15122026')
    })

    test('deve retornar objeto tipado corretamente', () => {
      const metadata = createMinimalMetadata()
      writeMetadata('typed', metadata)

      const loaded = load('typed')

      // Verificar inferência de tipos TypeScript
      expect(typeof loaded.bankCode).toBe('string')
      expect(typeof loaded.structure.totalLines).toBe('number')
      expect(Array.isArray(loaded.records)).toBe(true)
      expect(typeof loaded.records[0].amount).toBe('number')
    })
  })

  describe('Suporte a CNAB 400', () => {
    test('deve aceitar formato CNAB400', () => {
      const metadata = createMinimalMetadata()
      metadata.format = CNABFormatCode.CNAB400
      const fixturesDir400 = path.join(BASE_DIR, 'test-helper', '__fixtures__', CNABFormatCode.CNAB400)
      fs.mkdirSync(fixturesDir400, { recursive: true })
      fs.writeFileSync(path.join(fixturesDir400, `${CNABFormatCode.CNAB400}.json`), JSON.stringify(metadata, null, 2), 'utf8')

      const loaded = load(CNABFormatCode.CNAB400, CNABFormatCode.CNAB400)

      expect(loaded.format).toBe(CNABFormatCode.CNAB400)
    })
  })
})

// ===== Helpers para testes =====

/**
 * Cria metadados mínimos válidos para testes
 */
function createMinimalMetadata(): FixtureMetadata {
  return {
    description: 'Fixture de teste',
    bankCode: '237',
    bankName: 'Banco Teste',
    format: CNABFormatCode.CNAB240,
    structure: {
      totalLines: 3,
      headerLines: 1,
      detailLines: 1,
      trailerLines: 1
    },
    records: [
      {
        index: 0,
        name: 'TESTE DA SILVA',
        document: '11144477735',
        documentType: 'CPF',
        amount: 100.00,
        dueDate: '15/12/2026'
      }
    ],
    totals: {
      recordCount: 1,
      totalAmount: 100.00
    }
  }
}

/**
 * Escreve metadados no arquivo de teste
 */
function writeMetadata(name: string, metadata: Partial<FixtureMetadata>): void {
  const FIXTURES_DIR = path.join(__dirname, '__fixtures-tmp__', 'test-helper', '__fixtures__', CNABFormatCode.CNAB240)
  const filePath = path.join(FIXTURES_DIR, `${name}.json`)
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2), 'utf8')
}
