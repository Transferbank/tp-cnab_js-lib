import { CnabDocument400 } from './cnab-document-400'
import { CnabBoleto, BoletoReadResult } from '@/types/boleto/cnab-boleto'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { CNABDocumentValidationError } from '@/types/errors/field-errors'

class MockCnabBoleto extends CnabBoleto {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }

  protected get lineLength(): number {
    return 400
  }

  protected readonly nossoNumeroField: any
  protected readonly numeroDocumentoField: any
  protected readonly vencimentoField: any
  protected readonly valorField: any
  protected readonly dataEmissaoField: any
  protected readonly descontoValorField: any
  protected readonly abatimentoValorField: any
  protected readonly sacadoDocumentoField: any
  protected readonly sacadoNomeField: any
  protected readonly sacadoLogradouroField: any
  protected readonly sacadoCepField: any

  private static readonly EMPTY_EXTRA_FIELDS: any[] = []
  protected get extraFields() { return MockCnabBoleto.EMPTY_EXTRA_FIELDS }

  readSimple(): BoletoReadResult {
    return {
      data: {
        nossoNumero: 'mock-001',
        numeroDocumento: 'DOC-001',
        vencimento: new Date('2026-12-31'),
        valor: 100.0,
        dataEmissao: new Date('2026-01-01'),
        desconto: { valor: 0 },
        abatimento: { valor: 0 },
        sacado: {
          documento: '12345678900',
          nome: 'Mock Sacado',
          endereco: { logradouro: 'Rua Mock', cep: '12345-678' },
        },
      },
      errors: []
    }
  }
}

class TestCnabDocument400 extends CnabDocument400<MockCnabBoleto> {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }

  protected get BoletoClass(): new (lines: string[]) => MockCnabBoleto {
    return MockCnabBoleto
  }
}

describe('CnabDocument400', () => {
  const createLine = (recordType: string): string => {
    return recordType.padEnd(400, ' ')
  }

  describe('validateHeader', () => {
    test('aceita header válido tipo 0', () => {
      const lines = [createLine('0'), createLine('1'), createLine('9')]
      expect(() => {
        new TestCnabDocument400(lines)
      }).not.toThrow()
    })

    test('rejeita arquivo com menos de 2 linhas', () => {
      const lines = [createLine('0')]
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow('arquivo deve ter pelo menos header e trailer')
    })

    test('rejeita header com tamanho incorreto', () => {
      const lines = ['0'.padEnd(350, ' '), createLine('1'), createLine('9')]
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow('header deve ter 400 caracteres')
    })

    test('rejeita header com tipo diferente de 0', () => {
      const lines = [createLine('1'), createLine('1'), createLine('9')]
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow("header deve ser tipo '0'")
    })
  })

  describe('validateTrailer', () => {
    test('rejeita trailer com tamanho incorreto', () => {
      const lines = [createLine('0'), createLine('1'), '9'.padEnd(350, ' ')]
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow('trailer deve ter 400 caracteres')
    })

    test('rejeita trailer com tipo diferente de 9', () => {
      const lines = [createLine('0'), createLine('1'), createLine('1')]
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow("trailer deve ser tipo '9'")
    })
  })

  describe('groupBoletos', () => {
    test('agrupa boleto simples sem satélites', () => {
      const lines = [createLine('0'), createLine('1'), createLine('9')]
      const doc = new TestCnabDocument400(lines)

      expect(doc.boletoCount).toBe(1)
      const boleto = doc.getBoleto(0)
      expect(boleto).toBeInstanceOf(MockCnabBoleto)
    })

    test('agrupa boleto com múltiplos satélites', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('2'),
        createLine('6'),
        createLine('9'),
      ]
      const doc = new TestCnabDocument400(lines)

      expect(doc.boletoCount).toBe(1)
    })

    test('agrupa múltiplos boletos corretamente', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('2'),
        createLine('1'),
        createLine('6'),
        createLine('1'),
        createLine('9'),
      ]
      const doc = new TestCnabDocument400(lines)

      expect(doc.boletoCount).toBe(3)
    })

    test('registra erro de satélite órfão antes de qualquer núcleo', () => {
      const lines = [createLine('0'), createLine('2'), createLine('9')]
      
      const doc = new TestCnabDocument400(lines)
      
      expect(doc.hasStructureErrors).toBe(true)
      expect(doc.structureErrors).toHaveLength(1)
      expect(doc.structureErrors[0].message).toContain("satélite tipo '2' sem núcleo precedente")
      expect(doc.boletoCount).toBe(0)
    })

    test('rejeita tipo estrutural no corpo', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('0'),
        createLine('9'),
      ]
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow(/tipo estrutural '0' não deve aparecer no corpo/)
    })

    test('rejeita tipo de registro não reconhecido', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('5'),
        createLine('9'),
      ]
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines)
      }).toThrow(/tipo de registro '5' não reconhecido/)
    })

    test('aceita arquivo sem boletos (apenas header e trailer)', () => {
      const lines = [createLine('0'), createLine('9')]
      const doc = new TestCnabDocument400(lines)

      expect(doc.boletoCount).toBe(0)
      expect(doc.readAll()).toEqual([])
    })

    test('recupera de satélite órfão e continua processando', () => {
      const lines = [
        createLine('0'),
        createLine('2'),
        createLine('1'),
        createLine('9'),
      ]
      const doc = new TestCnabDocument400(lines)

      expect(doc.hasStructureErrors).toBe(true)
      expect(doc.structureErrors).toHaveLength(1)
      expect(doc.structureErrors[0].message).toContain("satélite tipo '2' sem núcleo precedente")
      expect(doc.boletoCount).toBe(1)
    })

    test('recupera de múltiplos satélites órfãos', () => {
      const lines = [
        createLine('0'),
        createLine('2'),
        createLine('6'),
        createLine('1'),
        createLine('9'),
      ]
      const doc = new TestCnabDocument400(lines)

      expect(doc.hasStructureErrors).toBe(true)
      expect(doc.structureErrors).toHaveLength(2)
      expect(doc.structureErrors[0].message).toContain("satélite tipo '2' sem núcleo precedente")
      expect(doc.structureErrors[1].message).toContain("satélite tipo '6' sem núcleo precedente")
      expect(doc.boletoCount).toBe(1)
    })
  })

  describe('integração com getBoleto e readAll', () => {
    test('readAll processa todos os boletos', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('1'),
        createLine('1'),
        createLine('9'),
      ]
      const doc = new TestCnabDocument400(lines)

      const results = doc.readAll()
      expect(results).toHaveLength(3)
      expect(results.every((r) => r.success)).toBe(true)
    })
  })

  describe('recuperação com fixtures mutados', () => {
    const loadFixture = (): string[] => {
      const fs = require('fs')
      const path = require('path')
      const fixturePath = path.join(
        __dirname,
        '../../../banks/bradesco/docs/cnab400/bradesco_cnab_400.txt'
      )
      const content = fs.readFileSync(fixturePath, 'latin1')
      return content.split(/\r?\n/).filter((line: string) => line.length > 0)
    }

    test('satélite órfão: não lança, registra erro, resto do arquivo legível', () => {
      const lines = loadFixture()
      const mutated = [...lines]
      mutated.splice(1, 0, createLine('2'))

      const doc = new TestCnabDocument400(mutated)

      expect(doc.hasStructureErrors).toBe(true)
      expect(doc.structureErrors.some(e => e.message.includes('satélite tipo') && e.message.includes('sem núcleo precedente'))).toBe(true)
      expect(doc.boletoCount).toBeGreaterThan(0)
      expect(() => doc.getBoleto(0)).not.toThrow()
    })

    test('múltiplos satélites órfãos: não lança, registra erros, boletos válidos acessíveis', () => {
      const lines = loadFixture()
      const mutated = [...lines]
      mutated.splice(1, 0, createLine('2'))
      mutated.splice(3, 0, createLine('6'))

      const doc = new TestCnabDocument400(mutated)

      expect(doc.hasStructureErrors).toBe(true)
      expect(doc.structureErrors.length).toBeGreaterThanOrEqual(1)
      expect(doc.boletoCount).toBeGreaterThan(0)
    })
  })
})
