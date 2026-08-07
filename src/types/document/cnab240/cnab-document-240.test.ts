import { CnabDocument240 } from './cnab-document-240'
import { CnabBoleto } from '@/types/boleto/cnab-boleto'
import { BoletoCnabData } from '@/types/read/boleto-cnab-data'
import { BANK_CODES } from '@/types/bank/bank-codes'
import * as fs from 'fs'
import * as path from 'path'

class MockCnabBoleto extends CnabBoleto {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }

  protected get lineLength(): number {
    return 240
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
      nossoNumero: 'mock-240',
      numeroDocumento: 'DOC-240',
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

class TestCnabDocument240 extends CnabDocument240<MockCnabBoleto> {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }
}

describe('CnabDocument240', () => {
  const loadFixture = (): string[] => {
    const fixturePath = path.join(
      __dirname,
      '../../../banks/bradesco/docs/cnab240/bradesco_cnab_240.txt'
    )
    const content = fs.readFileSync(fixturePath, 'latin1')
    return content.split(/\r?\n/).filter((line) => line.length > 0)
  }

  const createLine = (type: string, segment?: string): string => {
    const segmentPart = segment ? segment.padEnd(1, ' ') : ' '
    return ' '.repeat(7) + type + ' '.repeat(5) + segmentPart + ' '.repeat(226)
  }

  describe('validação estrutural', () => {
    test('rejeita arquivo com menos de 2 linhas', () => {
      const header = createLine('0')
      expect(() => {
        new TestCnabDocument240([header], MockCnabBoleto)
      }).toThrow('arquivo deve ter pelo menos header e trailer')
    })

    test('rejeita header com tamanho ou tipo incorreto', () => {
      const headerWrongSize = '0' + ' '.repeat(100)
      const trailer = createLine('9')
      expect(() => {
        new TestCnabDocument240([headerWrongSize, trailer], MockCnabBoleto)
      }).toThrow('header de arquivo deve ter 240 caracteres')

      const headerWrongType = createLine('1')
      expect(() => {
        new TestCnabDocument240([headerWrongType, trailer], MockCnabBoleto)
      }).toThrow("header de arquivo deve ser tipo '0'")
    })

    test('rejeita trailer com tamanho ou tipo incorreto', () => {
      const header = createLine('0')
      const trailerWrongSize = '9' + ' '.repeat(100)
      expect(() => {
        new TestCnabDocument240([header, trailerWrongSize], MockCnabBoleto)
      }).toThrow('trailer de arquivo deve ter 240 caracteres')

      const trailerWrongType = createLine('5')
      expect(() => {
        new TestCnabDocument240([header, trailerWrongType], MockCnabBoleto)
      }).toThrow("trailer de arquivo deve ser tipo '9'")
    })
  })

  describe('agrupamento de boletos', () => {
    test('agrupa boleto P+Q simples', () => {
      const header = createLine('0')
      const loteHeader = createLine('1')
      const segmentP = createLine('3', 'P')
      const segmentQ = createLine('3', 'Q')
      const loteTrailer = createLine('5')
      const trailer = createLine('9')

      const doc = new TestCnabDocument240(
        [header, loteHeader, segmentP, segmentQ, loteTrailer, trailer],
        MockCnabBoleto
      )

      expect(doc.boletoCount).toBe(1)
    })

    test('agrupa boleto com satélites opcionais', () => {
      const header = createLine('0')
      const loteHeader = createLine('1')
      const segmentP = createLine('3', 'P')
      const segmentQ = createLine('3', 'Q')
      const segmentR = createLine('3', 'R')
      const segmentS = createLine('3', 'S')
      const loteTrailer = createLine('5')
      const trailer = createLine('9')

      const doc = new TestCnabDocument240(
        [header, loteHeader, segmentP, segmentQ, segmentR, segmentS, loteTrailer, trailer],
        MockCnabBoleto
      )

      expect(doc.boletoCount).toBe(1)
    })

    test('agrupa múltiplos boletos e lotes', () => {
      const header = createLine('0')
      const lote1Header = createLine('1')
      const segmentP1 = createLine('3', 'P')
      const segmentQ1 = createLine('3', 'Q')
      const segmentP2 = createLine('3', 'P')
      const segmentQ2 = createLine('3', 'Q')
      const lote1Trailer = createLine('5')
      const lote2Header = createLine('1')
      const segmentP3 = createLine('3', 'P')
      const segmentQ3 = createLine('3', 'Q')
      const lote2Trailer = createLine('5')
      const trailer = createLine('9')

      const doc = new TestCnabDocument240(
        [
          header,
          lote1Header,
          segmentP1,
          segmentQ1,
          segmentP2,
          segmentQ2,
          lote1Trailer,
          lote2Header,
          segmentP3,
          segmentQ3,
          lote2Trailer,
          trailer
        ],
        MockCnabBoleto
      )

      expect(doc.boletoCount).toBe(3)
    })

    test('reconhece variantes de segmento Y', () => {
      const header = createLine('0')
      const loteHeader = createLine('1')
      const segmentP = createLine('3', 'P')
      const segmentQ = createLine('3', 'Q')
      const segmentY01 = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Y' + ' '.repeat(3) + '01' + ' '.repeat(221)
      const segmentY04 = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Y' + ' '.repeat(3) + '04' + ' '.repeat(221)
      const loteTrailer = createLine('5')
      const trailer = createLine('9')

      const doc = new TestCnabDocument240(
        [header, loteHeader, segmentP, segmentQ, segmentY01, segmentY04, loteTrailer, trailer],
        MockCnabBoleto
      )

      expect(doc.boletoCount).toBe(1)
    })

    test('aceita arquivo sem boletos', () => {
      const header = createLine('0')
      const trailer = createLine('9')

      const doc = new TestCnabDocument240([header, trailer], MockCnabBoleto)

      expect(doc.boletoCount).toBe(0)
    })
  })

  describe('validação de erros de estrutura de lote', () => {
    test('rejeita header de lote duplicado', () => {
      const header = createLine('0')
      const loteHeader1 = createLine('1')
      const loteHeader2 = createLine('1')
      const trailer = createLine('9')

      expect(() => {
        new TestCnabDocument240(
          [header, loteHeader1, loteHeader2, trailer],
          MockCnabBoleto
        )
      }).toThrow('header de lote dentro de outro lote')
    })

    test('rejeita trailer de lote sem header', () => {
      const header = createLine('0')
      const loteTrailer = createLine('5')
      const trailer = createLine('9')

      expect(() => {
        new TestCnabDocument240([header, loteTrailer, trailer], MockCnabBoleto)
      }).toThrow('trailer de lote sem header de lote correspondente')
    })

    test('rejeita P sem Q antes do trailer de lote', () => {
      const header = createLine('0')
      const loteHeader = createLine('1')
      const segmentP = createLine('3', 'P')
      const loteTrailer = createLine('5')
      const trailer = createLine('9')

      expect(() => {
        new TestCnabDocument240(
          [header, loteHeader, segmentP, loteTrailer, trailer],
          MockCnabBoleto
        )
      }).toThrow('boleto incompleto (núcleo P+Q) antes do trailer de lote')
    })

    test('rejeita Q sem P precedente', () => {
      const header = createLine('0')
      const loteHeader = createLine('1')
      const segmentQ = createLine('3', 'Q')
      const loteTrailer = createLine('5')
      const trailer = createLine('9')

      expect(() => {
        new TestCnabDocument240(
          [header, loteHeader, segmentQ, loteTrailer, trailer],
          MockCnabBoleto
        )
      }).toThrow('segmento Q sem segmento P correspondente')
    })

    test('rejeita satélite antes do núcleo P+Q completo', () => {
      const header = createLine('0')
      const loteHeader = createLine('1')
      const segmentP = createLine('3', 'P')
      const segmentR = createLine('3', 'R')
      const loteTrailer = createLine('5')
      const trailer = createLine('9')

      expect(() => {
        new TestCnabDocument240(
          [header, loteHeader, segmentP, segmentR, loteTrailer, trailer],
          MockCnabBoleto
        )
      }).toThrow("satélite 'R' antes do núcleo P+Q estar completo")
    })

    test('rejeita segmento fora de lote', () => {
      const header = createLine('0')
      const segmentP = createLine('3', 'P')
      const trailer = createLine('9')

      expect(() => {
        new TestCnabDocument240([header, segmentP, trailer], MockCnabBoleto)
      }).toThrow('segmento fora de um lote')
    })

    test('rejeita arquivo terminando com lote aberto', () => {
      const header = createLine('0')
      const loteHeader = createLine('1')
      const segmentP = createLine('3', 'P')
      const segmentQ = createLine('3', 'Q')
      const trailer = createLine('9')

      expect(() => {
        new TestCnabDocument240(
          [header, loteHeader, segmentP, segmentQ, trailer],
          MockCnabBoleto
        )
      }).toThrow('arquivo termina com lote aberto')
    })

    test('rejeita tipo de registro não reconhecido', () => {
      const header = createLine('0')
      const loteHeader = createLine('1')
      const invalidLine = createLine('7')
      const trailer = createLine('9')

      expect(() => {
        new TestCnabDocument240(
          [header, loteHeader, invalidLine, trailer],
          MockCnabBoleto
        )
      }).toThrow("tipo de registro '7' não reconhecido no corpo do arquivo")
    })
  })

  describe('fixture real Bradesco CNAB 240', () => {
    test('processa fixture com 3 boletos (P+Q+R+S cada)', () => {
      const lines = loadFixture()

      const doc = new TestCnabDocument240(lines, MockCnabBoleto)

      expect(lines).toHaveLength(16)
      expect(doc.boletoCount).toBe(3)
      
      const results = doc.readAll()
      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
    })
  })

  describe('integração com getBoleto e readAll', () => {
    test('getBoleto retorna instâncias corretas', () => {
      const header = createLine('0')
      const loteHeader = createLine('1')
      const segmentP1 = createLine('3', 'P')
      const segmentQ1 = createLine('3', 'Q')
      const segmentP2 = createLine('3', 'P')
      const segmentQ2 = createLine('3', 'Q')
      const loteTrailer = createLine('5')
      const trailer = createLine('9')

      const doc = new TestCnabDocument240(
        [header, loteHeader, segmentP1, segmentQ1, segmentP2, segmentQ2, loteTrailer, trailer],
        MockCnabBoleto
      )

      const boleto0 = doc.getBoleto(0)
      const boleto1 = doc.getBoleto(1)

      expect(boleto0).toBeInstanceOf(MockCnabBoleto)
      expect(boleto1).toBeInstanceOf(MockCnabBoleto)
      expect(boleto0).not.toBe(boleto1)
    })

    test('readAll processa todos os boletos', () => {
      const header = createLine('0')
      const loteHeader = createLine('1')
      const segmentP1 = createLine('3', 'P')
      const segmentQ1 = createLine('3', 'Q')
      const segmentP2 = createLine('3', 'P')
      const segmentQ2 = createLine('3', 'Q')
      const loteTrailer = createLine('5')
      const trailer = createLine('9')

      const doc = new TestCnabDocument240(
        [header, loteHeader, segmentP1, segmentQ1, segmentP2, segmentQ2, loteTrailer, trailer],
        MockCnabBoleto
      )

      const results = doc.readAll()

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[0].index).toBe(0)
      expect(results[1].success).toBe(true)
      expect(results[1].index).toBe(1)
    })
  })
})
