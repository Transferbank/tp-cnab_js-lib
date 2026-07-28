/**
 * Testes para o helper de metadados de fixtures
 */

import * as fs from 'fs'
import * as path from 'path'
import { loadFixtureMetadata } from './fixture-metadata'
import { FixtureMetadata } from '@tp-types/testing'
import { CNABFormatCode } from '@tp-types/index'

describe('Helper: loadFixtureMetadata', () => {
  const FIXTURES_DIR = path.join(__dirname, '../fixtures/cnab240/test-helper')
  
  beforeAll(() => {
    // Criar diret�rio de teste
    if (!fs.existsSync(FIXTURES_DIR)) {
      fs.mkdirSync(FIXTURES_DIR, { recursive: true })
    }
  })

  afterAll(() => {
    // Limpar arquivos de teste
    if (fs.existsSync(FIXTURES_DIR)) {
      const files = fs.readdirSync(FIXTURES_DIR)
      files.forEach(file => {
        fs.unlinkSync(path.join(FIXTURES_DIR, file))
      })
      fs.rmdirSync(FIXTURES_DIR)
    }
  })

  describe('Valida��o de arquivo', () => {
    test('deve lan�ar erro se arquivo JSON n�o existe', () => {
      expect(() => {
        loadFixtureMetadata('test-helper', 'nao-existe')
      }).toThrow(/Arquivo de metadados n�o encontrado/)
    })

    test('deve lan�ar erro se JSON � inv�lido', () => {
      const invalidJsonPath = path.join(FIXTURES_DIR, 'invalid.json')
      fs.writeFileSync(invalidJsonPath, '{ invalid json }', 'utf8')

      expect(() => {
        loadFixtureMetadata('test-helper', 'invalid')
      }).toThrow(/JSON inv�lido/)
    })

    test('deve lan�ar erro se arquivo n�o � um objeto', () => {
      const arrayJsonPath = path.join(FIXTURES_DIR, 'array.json')
      fs.writeFileSync(arrayJsonPath, '[]', 'utf8')

      expect(() => {
        loadFixtureMetadata('test-helper', 'array')
      }).toThrow(/Esperado: objeto JSON/)
    })
  })

  describe('Valida��o de campos obrigat�rios', () => {
    test('deve lan�ar erro se campo "description" ausente', () => {
      const metadata = createMinimalMetadata()
      delete (metadata as any).description
      writeMetadata('no-description', metadata)

      expect(() => {
        loadFixtureMetadata('test-helper', 'no-description')
      }).toThrow(/Campo obrigat�rio ausente: "description"/)
    })

    test('deve lan�ar erro se campo "bankCode" ausente', () => {
      const metadata = createMinimalMetadata()
      delete (metadata as any).bankCode
      writeMetadata('no-bankcode', metadata)

      expect(() => {
        loadFixtureMetadata('test-helper', 'no-bankcode')
      }).toThrow(/Campo obrigat�rio ausente: "bankCode"/)
    })

    test('deve lan�ar erro se campo "format" tem valor inv�lido', () => {
      const metadata = createMinimalMetadata()
      ;(metadata as any).format = 'CNAB300' // inv�lido
      writeMetadata('invalid-format', metadata)

      expect(() => {
        loadFixtureMetadata('test-helper', 'invalid-format')
      }).toThrow(/Campo "format" inv�lido/)
    })

    test('deve lan�ar erro se campo "records" est� vazio', () => {
      const metadata = createMinimalMetadata()
      metadata.records = []
      writeMetadata('empty-records', metadata)

      expect(() => {
        loadFixtureMetadata('test-helper', 'empty-records')
      }).toThrow(/Campo "records" n�o pode ser vazio/)
    })
  })

  describe('Valida��o de structure', () => {
    test('deve lan�ar erro se structure.totalLines ausente', () => {
      const metadata = createMinimalMetadata()
      delete (metadata.structure as any).totalLines
      writeMetadata('no-totallines', metadata)

      expect(() => {
        loadFixtureMetadata('test-helper', 'no-totallines')
      }).toThrow(/Campo obrigat�rio ausente: "totalLines"/)
    })

    test('deve lan�ar erro se structure.totalLines � negativo', () => {
      const metadata = createMinimalMetadata()
      metadata.structure.totalLines = -5
      writeMetadata('negative-totallines', metadata)

      expect(() => {
        loadFixtureMetadata('test-helper', 'negative-totallines')
      }).toThrow(/deve ser um inteiro n�o-negativo/)
    })
  })

  describe('Valida��o de records', () => {
    test('deve lan�ar erro se record.documentType inv�lido', () => {
      const metadata = createMinimalMetadata()
      ;(metadata.records[0] as any).documentType = 'INVALIDO'
      writeMetadata('invalid-doctype', metadata)

      expect(() => {
        loadFixtureMetadata('test-helper', 'invalid-doctype')
      }).toThrow(/Campo "documentType" inv�lido/)
    })

    test('deve lan�ar erro se record.amount � negativo', () => {
      const metadata = createMinimalMetadata()
      metadata.records[0].amount = -100
      writeMetadata('negative-amount', metadata)

      expect(() => {
        loadFixtureMetadata('test-helper', 'negative-amount')
      }).toThrow(/Campo "amount" deve ser n�o-negativo/)
    })

    test('deve lan�ar erro se record.name ausente', () => {
      const metadata = createMinimalMetadata()
      delete (metadata.records[0] as any).name
      writeMetadata('no-name', metadata)

      expect(() => {
        loadFixtureMetadata('test-helper', 'no-name')
      }).toThrow(/Campo obrigat�rio ausente: "name"/)
    })
  })

  describe('Valida��o de totals', () => {
    test('deve lan�ar erro se totals.recordCount negativo', () => {
      const metadata = createMinimalMetadata()
      metadata.totals.recordCount = -1
      writeMetadata('negative-recordcount', metadata)

      expect(() => {
        loadFixtureMetadata('test-helper', 'negative-recordcount')
      }).toThrow(/deve ser n�o-negativo/)
    })

    test('deve lan�ar erro se totals.totalAmount negativo', () => {
      const metadata = createMinimalMetadata()
      metadata.totals.totalAmount = -100
      writeMetadata('negative-totalamount', metadata)

      expect(() => {
        loadFixtureMetadata('test-helper', 'negative-totalamount')
      }).toThrow(/deve ser n�o-negativo/)
    })
  })

  describe('Carregamento bem-sucedido', () => {
    test('deve carregar metadados v�lidos sem erros', () => {
      const metadata = createMinimalMetadata()
      writeMetadata('valid', metadata)

      const loaded = loadFixtureMetadata('test-helper', 'valid')

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

      const loaded = loadFixtureMetadata('test-helper', 'with-header')

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

      const loaded = loadFixtureMetadata('test-helper', 'with-raw')

      expect(loaded.records[0].documentRaw).toBe('000011144477735')
      expect(loaded.records[0].amountRaw).toBe('000000000010000')
      expect(loaded.records[0].dueDateRaw).toBe('15122026')
    })

    test('deve retornar objeto tipado corretamente', () => {
      const metadata = createMinimalMetadata()
      writeMetadata('typed', metadata)

      const loaded = loadFixtureMetadata('test-helper', 'typed')

      // Verificar infer�ncia de tipos TypeScript
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
      writeMetadata(CNABFormatCode.CNAB400, metadata)

      const loaded = loadFixtureMetadata('test-helper', CNABFormatCode.CNAB400)

      expect(loaded.format).toBe(CNABFormatCode.CNAB400)
    })
  })
})

// ===== Helpers para testes =====

/**
 * Cria metadados m�nimos v�lidos para testes
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
  const FIXTURES_DIR = path.join(__dirname, '../fixtures/cnab240/test-helper')
  const filePath = path.join(FIXTURES_DIR, `${name}.json`)
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2), 'utf8')
}
