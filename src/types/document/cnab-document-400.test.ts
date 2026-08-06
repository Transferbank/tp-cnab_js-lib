import { CnabDocument400 } from './cnab-document-400'
import { CnabBoleto } from '@/types/boleto/cnab-boleto'
import { BANK_CODES } from '@/types/bank/bank-codes'
import { CNABDocumentValidationError } from '@/types/errors/field-errors'
import { BoletoCnabData } from '@/types/read/boleto-cnab-data'

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

  readSimple(): BoletoCnabData {
    return {
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
    }
  }
}

class TestCnabDocument400 extends CnabDocument400<MockCnabBoleto> {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
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
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).not.toThrow()
    })

    test('rejeita arquivo com menos de 2 linhas', () => {
      const lines = [createLine('0')]
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow('arquivo deve ter pelo menos header e trailer')
    })

    test('rejeita header com tamanho incorreto', () => {
      const lines = ['0'.padEnd(350, ' '), createLine('1'), createLine('9')]
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow('header deve ter 400 caracteres')
    })

    test('rejeita header com tipo diferente de 0', () => {
      const lines = [createLine('1'), createLine('1'), createLine('9')]
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow("header deve ser tipo '0'")
    })
  })

  describe('validateTrailer', () => {
    test('aceita trailer válido tipo 9', () => {
      const lines = [createLine('0'), createLine('1'), createLine('9')]
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).not.toThrow()
    })

    test('rejeita trailer com tamanho incorreto', () => {
      const lines = [createLine('0'), createLine('1'), '9'.padEnd(350, ' ')]
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow('trailer deve ter 400 caracteres')
    })

    test('rejeita trailer com tipo diferente de 9', () => {
      const lines = [createLine('0'), createLine('1'), createLine('1')]
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow("trailer deve ser tipo '9'")
    })
  })

  describe('groupBoletos', () => {
    test('agrupa boleto simples sem satélites', () => {
      const lines = [createLine('0'), createLine('1'), createLine('9')]
      const doc = new TestCnabDocument400(lines, MockCnabBoleto)

      expect(doc.boletoCount).toBe(1)
      const boleto = doc.getBoleto(0)
      expect(boleto).toBeInstanceOf(MockCnabBoleto)
    })

    test('agrupa boleto com satélite tipo 2', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('2'),
        createLine('9'),
      ]
      const doc = new TestCnabDocument400(lines, MockCnabBoleto)

      expect(doc.boletoCount).toBe(1)
    })

    test('agrupa boleto com satélite tipo 6', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('6'),
        createLine('9'),
      ]
      const doc = new TestCnabDocument400(lines, MockCnabBoleto)

      expect(doc.boletoCount).toBe(1)
    })

    test('agrupa boleto com múltiplos satélites', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('2'),
        createLine('6'),
        createLine('9'),
      ]
      const doc = new TestCnabDocument400(lines, MockCnabBoleto)

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
      const doc = new TestCnabDocument400(lines, MockCnabBoleto)

      expect(doc.boletoCount).toBe(3)
    })

    test('ranges possuem índices corretos', () => {
      const lines = [
        createLine('0'), // 0
        createLine('1'), // 1 - boleto 0 start
        createLine('2'), // 2 - boleto 0 satélite
        createLine('1'), // 3 - boleto 1 start (boleto 0 end)
        createLine('9'), // 4
      ]
      const doc = new TestCnabDocument400(lines, MockCnabBoleto)

      expect(doc.boletoCount).toBe(2)
    })

    test('rejeita satélite órfão antes de qualquer núcleo', () => {
      const lines = [createLine('0'), createLine('2'), createLine('9')]
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow("satélite tipo '2' sem núcleo precedente")
    })

    test('rejeita tipo estrutural no corpo', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('0'),
        createLine('9'),
      ]
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow("tipo estrutural '0' não deve aparecer no corpo")
    })

    test('rejeita tipo de registro não reconhecido', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('5'),
        createLine('9'),
      ]
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow(CNABDocumentValidationError)
      expect(() => {
        new TestCnabDocument400(lines, MockCnabBoleto)
      }).toThrow("tipo de registro '5' não reconhecido")
    })

    test('aceita arquivo sem boletos (apenas header e trailer)', () => {
      const lines = [createLine('0'), createLine('9')]
      const doc = new TestCnabDocument400(lines, MockCnabBoleto)

      expect(doc.boletoCount).toBe(0)
      expect(doc.readAll()).toEqual([])
    })
  })

  describe('integração com getBoleto e readAll', () => {
    test('getBoleto retorna instâncias corretas', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('2'),
        createLine('1'),
        createLine('9'),
      ]
      const doc = new TestCnabDocument400(lines, MockCnabBoleto)

      const boleto0 = doc.getBoleto(0)
      const boleto1 = doc.getBoleto(1)

      expect(boleto0).toBeInstanceOf(MockCnabBoleto)
      expect(boleto1).toBeInstanceOf(MockCnabBoleto)
      expect(boleto0).not.toBe(boleto1)
    })

    test('readAll processa todos os boletos', () => {
      const lines = [
        createLine('0'),
        createLine('1'),
        createLine('1'),
        createLine('1'),
        createLine('9'),
      ]
      const doc = new TestCnabDocument400(lines, MockCnabBoleto)

      const results = doc.readAll()
      expect(results).toHaveLength(3)
      expect(results.every((r) => r.success)).toBe(true)
    })
  })
})
