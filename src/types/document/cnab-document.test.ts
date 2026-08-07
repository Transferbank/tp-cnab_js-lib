import { CnabDocument, BoletoRange } from './cnab-document'
import { CnabBoleto, BoletoReadResult } from '@/types/boleto/cnab-boleto'
import { CNABFormatCode } from '@/types/core/cnab'
import {
  CNABBoletoNotFoundError,
  CNABDocumentValidationError
} from '@/types/errors/field-errors'

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

class TestCnabDocument extends CnabDocument<MockCnabBoleto> {
  get type(): CNABFormatCode {
    return CNABFormatCode.CNAB400
  }

  private static _tempOptions: {
    headerValid?: boolean
    trailerValid?: boolean
    ranges?: BoletoRange[]
    boletoClass?: new (lines: string[]) => MockCnabBoleto
  } = {}

  private readonly _options: {
    headerValid?: boolean
    trailerValid?: boolean
    ranges?: BoletoRange[]
    boletoClass?: new (lines: string[]) => MockCnabBoleto
  }

  constructor(
    rawLines: string[],
    options: {
      headerValid?: boolean
      trailerValid?: boolean
      ranges?: BoletoRange[]
      boletoClass?: new (lines: string[]) => MockCnabBoleto
    }
  ) {
    TestCnabDocument._tempOptions = options
    super(rawLines)
    this._options = options
  }

  protected get BoletoClass(): new (lines: string[]) => MockCnabBoleto {
    return this._options.boletoClass ?? MockCnabBoleto
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
    boletoClass?: new (lines: string[]) => MockCnabBoleto
  } = {}
): TestCnabDocument {
  return new TestCnabDocument(rawLines, options)
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
    test('cria nova instância a cada chamada', () => {
      const lines = createLines(5)
      const doc = createTestDocument(lines, {
        ranges: [{ startLine: 1, endLine: 3 }],
      })

      const boleto1 = doc.getBoleto(0)
      const boleto2 = doc.getBoleto(0)
      expect(boleto1).not.toBe(boleto2)
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
      expect(results.every((r) => r.success)).toBe(true)
      expect(results[0].index).toBe(0)
      expect(results[1].index).toBe(1)
    })

    test('captura erro individual sem interromper processamento', () => {
      class FailingBoleto extends MockCnabBoleto {
        private static callCount = 0

        readSimple(): BoletoReadResult {
          FailingBoleto.callCount++
          if (FailingBoleto.callCount === 2) {
            throw new Error('Erro no boleto 2')
          }
          return super.readSimple()
        }
      }

      const lines = createLines(9)
      const doc = new TestCnabDocument(lines, {
        boletoClass: FailingBoleto as any,
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
  })

  describe('throwDocError', () => {
    class TestDocumentWithHelper extends TestCnabDocument {
      public testThrowDocError(reason: string, lineNumber?: number): never {
        return this.throwDocError(reason, lineNumber)
      }
    }

    test('lança CNABDocumentValidationError com reason', () => {
      const lines = createLines(5)
      const doc = new TestDocumentWithHelper(lines, {})

      expect(() => doc.testThrowDocError('erro de teste')).toThrow(
        CNABDocumentValidationError
      )
      expect(() => doc.testThrowDocError('erro de teste')).toThrow(
        'Arquivo inválido: erro de teste'
      )
    })

    test('lança CNABDocumentValidationError com reason e lineNumber', () => {
      const lines = createLines(5)
      const doc = new TestDocumentWithHelper(lines, {})

      expect(() => doc.testThrowDocError('tipo inválido', 5)).toThrow(
        CNABDocumentValidationError
      )
      expect(() => doc.testThrowDocError('tipo inválido', 5)).toThrow(
        'Arquivo inválido (linha 6): tipo inválido'
      )
    })
  })

  describe('recordDocError', () => {
    class TestDocumentWithRecorder extends TestCnabDocument {
      public testRecordDocError(reason: string, lineNumber?: number): void {
        return this.recordDocError(reason, lineNumber)
      }
    }

    test('registra erro sem lançar exceção', () => {
      const lines = createLines(5)
      const doc = new TestDocumentWithRecorder(lines, {})

      expect(() => doc.testRecordDocError('erro recuperável')).not.toThrow()
      expect(doc.structureErrors).toHaveLength(1)
      expect(doc.structureErrors[0].message).toContain('erro recuperável')
    })

    test('registra múltiplos erros', () => {
      const lines = createLines(5)
      const doc = new TestDocumentWithRecorder(lines, {})

      doc.testRecordDocError('erro 1', 0)
      doc.testRecordDocError('erro 2', 5)
      doc.testRecordDocError('erro 3')

      expect(doc.structureErrors).toHaveLength(3)
      expect(doc.structureErrors[0].message).toContain('erro 1')
      expect(doc.structureErrors[1].message).toContain('erro 2')
      expect(doc.structureErrors[2].message).toContain('erro 3')
    })

    test('hasStructureErrors retorna true quando há erros', () => {
      const lines = createLines(5)
      const doc = new TestDocumentWithRecorder(lines, {})

      expect(doc.hasStructureErrors).toBe(false)
      
      doc.testRecordDocError('erro')
      
      expect(doc.hasStructureErrors).toBe(true)
    })

    test('structureErrors retorna array vazio quando não há erros', () => {
      const lines = createLines(5)
      const doc = new TestDocumentWithRecorder(lines, {})

      expect(doc.structureErrors).toEqual([])
      expect(doc.hasStructureErrors).toBe(false)
    })
  })

  describe('coleta de erros parciais', () => {
    test('erro de campo em um boleto não interrompe leitura dos demais', () => {
      class BoletoWithFieldError extends MockCnabBoleto {
        private readonly index: number
        private static instanceCount = 0

        constructor(lines: string[]) {
          super(lines)
          this.index = BoletoWithFieldError.instanceCount++
        }

        readSimple(): BoletoReadResult {
          const result = super.readSimple()
          
          // Simula erro de campo no segundo boleto (índice 1)
          if (this.index === 1) {
            const { CNABFieldValidationError } = require('@/types/errors/field-errors')
            return {
              data: {
                nossoNumero: result.data.nossoNumero,
                numeroDocumento: result.data.numeroDocumento,
                // vencimento omitido (campo com erro)
                valor: result.data.valor,
                dataEmissao: result.data.dataEmissao,
                desconto: result.data.desconto,
                abatimento: result.data.abatimento,
                sacado: result.data.sacado,
              },
              errors: [
                new CNABFieldValidationError('vencimento', 'INVALID_DATE', 'data inválida')
              ]
            }
          }
          
          // Boletos 0 e 2 retornam sucesso
          return result
        }
      }

      const lines = createLines(10)
      const doc = new TestCnabDocument(lines, {
        boletoClass: BoletoWithFieldError as any,
        ranges: [
          { startLine: 1, endLine: 3 },  // Boleto 0
          { startLine: 3, endLine: 5 },  // Boleto 1 (com erro de campo)
          { startLine: 5, endLine: 7 },  // Boleto 2
        ],
      })

      const results = doc.readAll()

      expect(results).toHaveLength(3)

      // Boleto 0: sucesso completo
      expect(results[0].success).toBe(true)
      expect(results[0].fieldErrors).toBeUndefined()
      expect(results[0].data).toBeDefined()
      expect((results[0].data as any).nossoNumero).toBe('mock-001')

      // Boleto 1: falha com erro de campo
      expect(results[1].success).toBe(false)
      expect(results[1].fieldErrors).toBeDefined()
      expect(results[1].fieldErrors).toHaveLength(1)
      expect(results[1].fieldErrors![0].field).toBe('vencimento')
      expect(results[1].data).toBeDefined() // Dados parciais presentes
      expect((results[1].data as any).nossoNumero).toBe('mock-001')
      expect((results[1].data as any).numeroDocumento).toBe('DOC-001')

      // Boleto 2: sucesso completo (não foi afetado pelo erro do boleto 1)
      expect(results[2].success).toBe(true)
      expect(results[2].fieldErrors).toBeUndefined()
      expect(results[2].data).toBeDefined()
      expect((results[2].data as any).nossoNumero).toBe('mock-001')
    })
  })
})
