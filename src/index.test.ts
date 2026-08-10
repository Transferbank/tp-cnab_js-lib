import { openCnabFile } from './index'
import { CNABBoletoValidationError } from '@/types/errors/field-errors'
import { CNABNoLinesProvidedError } from '@/types/errors/error-types'
import * as fs from 'fs'
import * as path from 'path'

describe('openCnabFile', () => {
  const createFileFromPath = (filePath: string): File => {
    const buffer = fs.readFileSync(filePath)
    return new File([buffer], path.basename(filePath))
  }

  const loadFixture400 = (): File => {
    const fixturePath = path.join(
      __dirname,
      'banks/bradesco/docs/cnab400/bradesco_cnab_400.txt'
    )
    return createFileFromPath(fixturePath)
  }

  const loadFixture240 = (): File => {
    const fixturePath = path.join(
      __dirname,
      'banks/bradesco/docs/cnab240/bradesco_cnab_240.txt'
    )
    return createFileFromPath(fixturePath)
  }

  describe('Bradesco CNAB 400', () => {
    test('identifica quantidade correta de boletos no fixture', async () => {
      const file = loadFixture400()
      const doc = await openCnabFile(file)

      expect(doc.boletoCount).toBe(37)
    })

    test('lê dados completos do primeiro boleto corretamente', async () => {
      const file = loadFixture400()
      const doc = await openCnabFile(file)

      const boleto = doc.getBoleto(0)
      const result = boleto.read()

      expect(result.errors).toHaveLength(0)
      expect(result.data.nossoNumero).toBe('09100010629')
      expect(result.data.numeroDocumento).toBe('NF82760-03')
      expect(result.data.vencimento).toEqual(new Date(2026, 7, 24)) // agosto = mês 7 (0-indexed)
      expect(result.data.valor).toBe(22560.93)
      expect(result.data.dataEmissao).toEqual(new Date(2026, 4, 25)) // maio = mês 4
      expect(result.data.sacado?.documento).toBe('20000000997330')
      expect(result.data.sacado?.nome).toBe('COMERCIAL ALFA LTDA')
      expect(result.data.sacado?.endereco?.logradouro).toBe('AV EXEMPLO 200')
      expect(result.data.sacado?.endereco?.cep).toBe('29045402')
    })

    test('lê dados de múltiplos boletos corretamente', async () => {
      const file = loadFixture400()
      const doc = await openCnabFile(file)

      // Primeiro boleto
      const boleto0 = doc.getBoleto(0)
      const result0 = boleto0.read()
      expect(result0.errors).toHaveLength(0)
      expect(result0.data.numeroDocumento).toBe('NF82760-03')
      expect(result0.data.valor).toBe(22560.93)

      // Segundo boleto
      const boleto1 = doc.getBoleto(1)
      const result1 = boleto1.read()
      expect(result1.errors).toHaveLength(0)
      expect(result1.data.numeroDocumento).toBe('NF82761-04')
      expect(result1.data.valor).toBe(2890.5)

      // Terceiro boleto
      const boleto2 = doc.getBoleto(2)
      const result2 = boleto2.read()
      expect(result2.errors).toHaveLength(0)
      expect(result2.data.numeroDocumento).toBe('NF82761-03')
      expect(result2.data.valor).toBe(2890.5)
    })

    test('readAll retorna dados corretos para todos os boletos', async () => {
      const file = loadFixture400()
      const doc = await openCnabFile(file)

      const results = doc.readAll()

      expect(results).toHaveLength(37)
      
      // Verifica que todos foram processados com sucesso
      const successfulResults = results.filter((r) => r.success)
      expect(successfulResults).toHaveLength(37)

      // Verifica dados do primeiro boleto
      expect(results[0].success).toBe(true)
      expect(results[0].data).toBeDefined()
      const firstData = results[0].data as any
      expect(firstData.numeroDocumento).toBe('NF82760-03')
      expect(firstData.valor).toBe(22560.93)

      // Verifica dados do último boleto
      expect(results[36].success).toBe(true)
      expect(results[36].data).toBeDefined()
      const lastData = results[36].data as any
      expect(lastData.numeroDocumento).toBe('NF80387-03')
      expect(lastData.valor).toBe(1154.8)
    })

    test('boletos com satélites são processados corretamente', async () => {
      const file = loadFixture400()
      const doc = await openCnabFile(file)

      // Primeiro boleto tem satélite tipo 2
      const boleto0 = doc.getBoleto(0)
      const result = boleto0.readFull()

      expect(result.errors).toHaveLength(0)
      expect(result.data.numeroDocumento).toBe('NF82760-03')
      expect(result.data.extra).toBeDefined()
      expect(result.data.extra?.codigoOcorrencia).toBeDefined()
    })
  })

  describe('Bradesco CNAB 240', () => {
    test('identifica quantidade correta de boletos no fixture', async () => {
      const doc = await openCnabFile(loadFixture240())
      expect(doc.boletoCount).toBe(3)
    })

    test('lê dados completos do primeiro boleto corretamente', async () => {
      const doc = await openCnabFile(loadFixture240())
      const result = doc.getBoleto(0).read()

      expect(result.errors).toHaveLength(0)
      expect(result.data.nossoNumero).toBe('000123450010')
      expect(result.data.numeroDocumento).toBe('NF0000123')
      expect(result.data.vencimento).toEqual(new Date(2026, 11, 15))
      expect(result.data.valor).toBe(100)
      expect(result.data.dataEmissao).toEqual(new Date(2026, 11, 1))
      expect(result.data.sacado?.documento).toBe('10000791989')
      expect(result.data.sacado?.nome).toBe('JOAO EXEMPLO SILVA')
      expect(result.data.sacado?.endereco?.logradouro).toBe('RUA EXEMPLO 123')
      expect(result.data.sacado?.endereco?.cep).toBe('01234567')
    })

    test('lê dados de múltiplos boletos corretamente', async () => {
      const doc = await openCnabFile(loadFixture240())

      const result1 = doc.getBoleto(1).read()
      expect(result1.errors).toHaveLength(0)
      expect(result1.data.numeroDocumento).toBe('NF0000124')
      expect(result1.data.valor).toBe(250)
      
      const result2 = doc.getBoleto(2).read()
      expect(result2.errors).toHaveLength(0)
      expect(result2.data.numeroDocumento).toBe('NF0000125')
      expect(result2.data.valor).toBe(500)
    })

    test('readAll retorna dados corretos para todos os boletos', async () => {
      const doc = await openCnabFile(loadFixture240())
      const results = doc.readAll()

      expect(results).toHaveLength(3)
      expect(results.every((r) => r.success)).toBe(true)

      const first = results[0].data as any
      expect(first.numeroDocumento).toBe('NF0000123')
      expect(first.valor).toBe(100)

      const last = results[2].data as any
      expect(last.numeroDocumento).toBe('NF0000125')
      expect(last.valor).toBe(500)
    })

    test('boletos com campo extra carteira são processados corretamente', async () => {
      const doc = await openCnabFile(loadFixture240())
      const result = doc.getBoleto(0).readFull()
      expect(result.errors).toHaveLength(0)
      expect(result.data.extra?.carteira).toBe('001')
    })
  })

  describe('arquivo inválido', () => {
    test('arquivo vazio lança CNABNoLinesProvidedError', async () => {
      const emptyFile = new File([''], 'empty.txt')
      await expect(openCnabFile(emptyFile)).rejects.toThrow(CNABNoLinesProvidedError)
    })

    test('apenas linhas vazias lança CNABNoLinesProvidedError', async () => {
      const emptyLinesFile = new File(['\n\n\n'], 'empty-lines.txt')
      await expect(openCnabFile(emptyLinesFile)).rejects.toThrow(CNABNoLinesProvidedError)
    })

    test('linha interna com tamanho errado: construção passa, boleto captura erro estrutural', async () => {
      // Header válido: tipo 0 + literais + código banco nas posições 76-79
      let header = '01REMESSA01COBRANCA       ' + ' '.repeat(50) + '237' + 'BRADESCO       ' + ' '.repeat(300) + '000001'
      const invalidDetail = '1' + ' '.repeat(299)
      const trailer = '9' + ' '.repeat(399)

      const invalidFile = new File([[header, invalidDetail, trailer].join('\n')], 'invalid.txt')
      const doc = await openCnabFile(invalidFile)
      expect(doc.boletoCount).toBe(1)

      const result = doc.getBoleto(0).read()
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toBeInstanceOf(CNABBoletoValidationError)
      expect(result.errors[0].message).toContain('linha deve ter 400 caracteres, tem 300')
      expect(result.data).toEqual({})
    })
  })
})
