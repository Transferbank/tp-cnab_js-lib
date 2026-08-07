import { BoletoBradesco240 } from './boleto-bradesco-240'
import { ReadMode } from '@/types/core/read-mode'
import * as fs from 'fs'
import * as path from 'path'

describe('BoletoBradesco240', () => {
  let fixtureLines: string[]
  let firstBoleto: string[]

  beforeAll(() => {
    const fixturePath = path.join(__dirname, '../docs/cnab240/bradesco_cnab_240.txt')
    const content = fs.readFileSync(fixturePath, 'latin1')
    fixtureLines = content.split(/\r?\n/).filter((line) => line.length > 0)
    firstBoleto = fixtureLines.slice(2, 6)
  })

  const createValidSegments = (): string[] => {
    const segmentP = ' '.repeat(7) + '3' + ' '.repeat(5) + 'P' + ' '.repeat(226)
    const segmentQ = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Q' + ' '.repeat(226)
    return [segmentP, segmentQ]
  }

  describe('Validação no construtor', () => {
    test('aceita boleto válido com Segmentos P e Q', () => {
      const segments = createValidSegments()
      
      expect(() => new BoletoBradesco240(segments)).not.toThrow()
    })

    test('rejeita array vazio', () => {
      expect(() => new BoletoBradesco240([])).toThrow('boleto deve conter pelo menos uma linha')
    })

    test('rejeita array com menos de 2 linhas', () => {
      const singleLine = [' '.repeat(7) + '3' + ' '.repeat(5) + 'P' + ' '.repeat(226)]
      
      expect(() => new BoletoBradesco240(singleLine)).toThrow(
        'boleto CNAB 240 deve conter pelo menos 2 linhas'
      )
    })

    test('rejeita linha com tamanho incorreto', () => {
      const invalidLines = ['linha curta', 'outra linha']
      
      expect(() => new BoletoBradesco240(invalidLines)).toThrow('linha deve ter 240 caracteres')
    })

    test('rejeita primeira linha que não é Segmento P', () => {
      const invalidP = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Q' + ' '.repeat(226)
      const validQ = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Q' + ' '.repeat(226)
      
      expect(() => new BoletoBradesco240([invalidP, validQ])).toThrow(
        "primeira linha deve ser Segmento P (tipo '3', segmento 'P')"
      )
    })

    test('rejeita segunda linha que não é Segmento Q', () => {
      const validP = ' '.repeat(7) + '3' + ' '.repeat(5) + 'P' + ' '.repeat(226)
      const invalidQ = ' '.repeat(7) + '3' + ' '.repeat(5) + 'P' + ' '.repeat(226)
      
      expect(() => new BoletoBradesco240([validP, invalidQ])).toThrow(
        "segunda linha deve ser Segmento Q (tipo '3', segmento 'Q')"
      )
    })

    test('aceita boleto com segmentos opcionais (P+Q+R+S)', () => {
      const segmentP = ' '.repeat(7) + '3' + ' '.repeat(5) + 'P' + ' '.repeat(226)
      const segmentQ = ' '.repeat(7) + '3' + ' '.repeat(5) + 'Q' + ' '.repeat(226)
      const segmentR = ' '.repeat(7) + '3' + ' '.repeat(5) + 'R' + ' '.repeat(226)
      const segmentS = ' '.repeat(7) + '3' + ' '.repeat(5) + 'S' + ' '.repeat(226)
      
      expect(() => new BoletoBradesco240([segmentP, segmentQ, segmentR, segmentS])).not.toThrow()
    })
  })

  describe('readSimple()', () => {
    test('retorna apenas campos canônicos', () => {
      const boleto = new BoletoBradesco240(firstBoleto)
      const result = boleto.readSimple()

      expect(result.errors).toHaveLength(0)
      expect(result.data.nossoNumero).toBeDefined()
      expect(result.data.numeroDocumento).toBeDefined()
      expect(result.data.vencimento).toBeInstanceOf(Date)
      expect(result.data.valor).toBeGreaterThan(0)
      expect(result.data.dataEmissao).toBeInstanceOf(Date)
      expect(typeof result.data.desconto?.valor).toBe('number')
      expect(typeof result.data.abatimento?.valor).toBe('number')
      expect(result.data.sacado?.documento).toBeDefined()
      expect(result.data.sacado?.nome).toBeDefined()
      expect(result.data.sacado?.endereco?.logradouro).toBeDefined()
      expect(result.data.sacado?.endereco?.cep).toBeDefined()
    })
  })

  describe('readFull()', () => {
    test('retorna campos canônicos com extras', () => {
      const boleto = new BoletoBradesco240(firstBoleto)
      const result = boleto.readFull()

      expect(result.errors).toHaveLength(0)
      expect(result.data.nossoNumero).toBeDefined()
      expect(result.data.extra).toBeDefined()
      if (result.data.extra) {
        expect(result.data.extra.carteira).toBeDefined()
      }
    })
  })

  describe('read(mode)', () => {
    test('ReadMode.SIMPLE retorna apenas canônicos', () => {
      const boleto = new BoletoBradesco240(firstBoleto)
      
      const result = boleto.read(ReadMode.SIMPLE)
      
      expect(result.errors).toHaveLength(0)
      expect(result.data.nossoNumero).toBeDefined()
      expect(result.data.extra).toBeUndefined()
    })

    test('ReadMode.FULL retorna com extras', () => {
      const boleto = new BoletoBradesco240(firstBoleto)
      
      const result = boleto.read(ReadMode.FULL)
      
      expect(result.errors).toHaveLength(0)
      expect(result.data.nossoNumero).toBeDefined()
      expect(result.data.extra).toBeDefined()
      if (result.data.extra) {
        expect(result.data.extra.carteira).toBeDefined()
      }
    })

    test('padrão é SIMPLE', () => {
      const boleto = new BoletoBradesco240(firstBoleto)
      
      const result = boleto.read()
      
      expect(result.errors).toHaveLength(0)
      expect(result.data.extra).toBeUndefined()
    })
  })

  describe('fixture real Bradesco CNAB 240', () => {
    test('processa primeiro boleto do fixture', () => {
      const boleto = new BoletoBradesco240(firstBoleto)
      const result = boleto.readSimple()

      expect(result.errors).toHaveLength(0)
      expect(result.data.nossoNumero).toBeTruthy()
      expect(result.data.numeroDocumento).toBeTruthy()
      expect(result.data.vencimento).toBeInstanceOf(Date)
      expect(result.data.valor).toBeGreaterThan(0)
    })

    test('readFull retorna campo extra carteira', () => {
      const boleto = new BoletoBradesco240(firstBoleto)
      const result = boleto.readFull()

      expect(result.errors).toHaveLength(0)
      expect(result.data.extra).toBeDefined()
      if (result.data.extra) {
        expect(result.data.extra.carteira).toBeDefined()
        expect(typeof result.data.extra.carteira).toBe('string')
      }
    })
  })
})
