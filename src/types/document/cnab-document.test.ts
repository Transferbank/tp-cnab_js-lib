import { CnabDocument, BoletoRange } from './cnab-document'
import { CnabBoleto } from '@/types/boleto/cnab-boleto'
import { CNABFormatCode } from '@/types/core/cnab'
import {
  CNABBoletoNotFoundError,
  CNABDocumentValidationError
} from '@/types/errors/field-errors'
import { BoletoCnabData } from '@/types/read/boleto-cnab-data'

class MockCnabBoleto extends CnabBoleto {
  protected get bankCode(): string {
    return '999'
  }

  protected get lineLength(): number {
    return 10
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

class TestCnabDocument extends CnabDocument<MockCnabBoleto> {
  get type(): CNABFormatCode {
    return CNABFormatCode.CNAB400
  }

  private static _tempOptions: {
    headerValid?: boolean
    trailerValid?: boolean
    ranges?: BoletoRange[]
  } = {}

  private readonly _options: {
    headerValid?: boolean
    trailerValid?: boolean
    ranges?: BoletoRange[]
  }

  constructor(
    rawLines: string[],
    boletoClass: new (lines: string[]) => MockCnabBoleto,
    options: {
      headerValid?: boolean
      trailerValid?: boolean
      ranges?: BoletoRange[]
    }
  ) {
    TestCnabDocument._tempOptions = options
    super(rawLines, boletoClass)
    this._options = options
  }

  protected validateHeader(): void {
    const opts = this._options ?? TestCnabDocument._tempOptions
    if (opts.headerValid === false) {
      throw new Error('Header inválido')
    }
  }

  protected validateTrailer(): void {
    const opts = this._options ?? TestCnabDocument._tempOptions
    if (opts.trailerValid === false) {
      throw new Error('Trailer inválido')
    }
  }

  protected groupBoletos(): BoletoRange[] {
    const opts = this._options ?? TestCnabDocument._tempOptions
    return opts.ranges ?? []
  }
}

function createTestDocument(
  rawLines: string[],
  options: {
    headerValid?: boolean
    trailerValid?: boolean
    ranges?: BoletoRange[]
  } = {}
): TestCnabDocument {
  return new TestCnabDocument(rawLines, MockCnabBoleto, options)
}

describe('CnabDocument', () => {
  const createLines = (count: number): string[] => {
    return Array.from({ length: count }, (_, i) => `LINE${i}`.padEnd(10, ' '))
  }

  describe('construtor', () => {
    test('valida header antes de prosseguir', () => {
      const lines = createLines(5)
      expect(() => {
        createTestDocument(lines, { headerValid: false })
      }).toThrow('Header inválido')
    })

    test('valida trailer após header', () => {
      const lines = createLines(5)
      expect(() => {
        createTestDocument(lines, { trailerValid: false })
      }).toThrow('Trailer inválido')
    })

    test('agrupa boletos após validações', () => {
      const lines = createLines(5)
      const doc = createTestDocument(lines, {
        ranges: [
          { startLine: 1, endLine: 3 },
          { startLine: 3, endLine: 5 },
        ],
      })
      expect(doc.boletoCount).toBe(2)
    })
  })

  describe('boletoCount', () => {
    test('retorna quantidade de boletos agrupados', () => {
      const lines = createLines(10)
      const doc = createTestDocument(lines, {
        ranges: [
          { startLine: 1, endLine: 3 },
          { startLine: 3, endLine: 5 },
          { startLine: 5, endLine: 8 },
        ],
      })
      expect(doc.boletoCount).toBe(3)
    })

    test('retorna 0 quando não há boletos', () => {
      const lines = createLines(2)
      const doc = createTestDocument(lines, { ranges: [] })
      expect(doc.boletoCount).toBe(0)
    })
  })

  describe('getBoleto', () => {
    test('retorna boleto no índice válido', () => {
      const lines = createLines(5)
      const doc = createTestDocument(lines, {
        ranges: [
          { startLine: 1, endLine: 3 },
          { startLine: 3, endLine: 5 },
        ],
      })

      const boleto = doc.getBoleto(0)
      expect(boleto).toBeInstanceOf(MockCnabBoleto)
    })

    test('cria nova instância a cada chamada', () => {
      const lines = createLines(5)
      const doc = createTestDocument(lines, {
        ranges: [{ startLine: 1, endLine: 3 }],
      })

      const boleto1 = doc.getBoleto(0)
      const boleto2 = doc.getBoleto(0)
      expect(boleto1).not.toBe(boleto2)
    })

    test('passa slice correto das linhas para o boleto', () => {
      const lines = ['LINE0     ', 'LINE1     ', 'LINE2     ', 'LINE3     ', 'LINE4     ']
      const doc = createTestDocument(lines, {
        ranges: [{ startLine: 1, endLine: 3 }],
      })

      const boleto = doc.getBoleto(0)
      expect(boleto.read().nossoNumero).toBe('mock-001')
    })

    test('lança CNABBoletoNotFoundError para índice negativo', () => {
      const lines = createLines(5)
      const doc = createTestDocument(lines, {
        ranges: [{ startLine: 1, endLine: 3 }],
      })

      expect(() => doc.getBoleto(-1)).toThrow(CNABBoletoNotFoundError)
    })

    test('lança CNABBoletoNotFoundError para índice >= boletoCount', () => {
      const lines = createLines(5)
      const doc = createTestDocument(lines, {
        ranges: [
          { startLine: 1, endLine: 3 },
          { startLine: 3, endLine: 5 },
        ],
      })

      expect(() => doc.getBoleto(2)).toThrow(CNABBoletoNotFoundError)
      expect(() => doc.getBoleto(5)).toThrow(CNABBoletoNotFoundError)
    })

    test('CNABBoletoNotFoundError contém índice e total corretos', () => {
      const lines = createLines(5)
      const doc = createTestDocument(lines, {
        ranges: [{ startLine: 1, endLine: 3 }],
      })

      try {
        doc.getBoleto(5)
        fail('Deveria ter lançado CNABBoletoNotFoundError')
      } catch (error) {
        expect(error).toBeInstanceOf(CNABBoletoNotFoundError)
        const err = error as CNABBoletoNotFoundError
        expect(err.index).toBe(5)
        expect(err.boletoCount).toBe(1)
      }
    })
  })

  describe('readAll', () => {
    test('retorna array vazio quando não há boletos', () => {
      const lines = createLines(2)
      const doc = createTestDocument(lines, { ranges: [] })

      const results = doc.readAll()
      expect(results).toEqual([])
    })

    test('retorna sucesso para todos os boletos válidos', () => {
      const lines = createLines(7)
      const doc = createTestDocument(lines, {
        ranges: [
          { startLine: 1, endLine: 3 },
          { startLine: 3, endLine: 5 },
        ],
      })

      const results = doc.readAll()
      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[0].index).toBe(0)
      expect(results[0].data).toBeDefined()
      expect(results[1].success).toBe(true)
      expect(results[1].index).toBe(1)
      expect(results[1].data).toBeDefined()
    })

    test('captura erro individual sem interromper processamento', () => {
      class FailingBoleto extends MockCnabBoleto {
        private static callCount = 0

        readSimple(): BoletoCnabData {
          FailingBoleto.callCount++
          if (FailingBoleto.callCount === 2) {
            throw new Error('Erro no boleto 2')
          }
          return super.readSimple()
        }
      }

      const lines = createLines(9)
      const doc = new TestCnabDocument(lines, FailingBoleto as any, {
        ranges: [
          { startLine: 1, endLine: 3 },
          { startLine: 3, endLine: 5 },
          { startLine: 5, endLine: 7 },
        ],
      })

      const results = doc.readAll()
      expect(results).toHaveLength(3)
      expect(results[0].success).toBe(true)
      expect(results[0].data).toBeDefined()
      expect(results[1].success).toBe(false)
      expect(results[1].error).toBeDefined()
      expect(results[1].error?.message).toBe('Erro no boleto 2')
      expect(results[2].success).toBe(true)
      expect(results[2].data).toBeDefined()
    })

    test('cada resultado tem índice correto', () => {
      const lines = createLines(7)
      const doc = createTestDocument(lines, {
        ranges: [
          { startLine: 1, endLine: 2 },
          { startLine: 2, endLine: 4 },
          { startLine: 4, endLine: 6 },
        ],
      })

      const results = doc.readAll()
      expect(results[0].index).toBe(0)
      expect(results[1].index).toBe(1)
      expect(results[2].index).toBe(2)
    })
  })

  describe('throwDocError', () => {
    class TestDocumentWithHelper extends TestCnabDocument {
      public testThrowDocError(reason: string, lineNumber?: number): never {
        return this.throwDocError(reason, lineNumber)
      }
    }

    test('lança CNABDocumentValidationError com reason', () => {
      const lines = createLines(5)
      const doc = new TestDocumentWithHelper(lines, MockCnabBoleto, {})

      expect(() => doc.testThrowDocError('erro de teste')).toThrow(
        CNABDocumentValidationError
      )
      expect(() => doc.testThrowDocError('erro de teste')).toThrow(
        'Arquivo inválido: erro de teste'
      )
    })

    test('lança CNABDocumentValidationError com reason e lineNumber', () => {
      const lines = createLines(5)
      const doc = new TestDocumentWithHelper(lines, MockCnabBoleto, {})

      expect(() => doc.testThrowDocError('tipo inválido', 5)).toThrow(
        CNABDocumentValidationError
      )
      expect(() => doc.testThrowDocError('tipo inválido', 5)).toThrow(
        'Arquivo inválido (linha 6): tipo inválido'
      )
    })
  })
})
