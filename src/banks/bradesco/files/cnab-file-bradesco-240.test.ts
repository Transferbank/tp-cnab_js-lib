import { CnabFileBradesco240 } from './cnab-file-bradesco-240'
import { BoletoBradesco240 } from '@/banks/bradesco/boletos/boleto-bradesco-240'
import * as fs from 'fs'
import * as path from 'path'

describe('CnabFileBradesco240', () => {
  let fixtureLines: string[]

  beforeAll(() => {
    const fixturePath = path.join(__dirname, '../docs/cnab240/bradesco_cnab_240.txt')
    const content = fs.readFileSync(fixturePath, 'latin1')
    fixtureLines = content.split(/\r?\n/).filter((line) => line.length > 0)
  })

  const createValidHeader = (): string => {
    // CNAB240: 240 caracteres por linha
    let header = '237' // posições 0-2: código do banco
    header += '0000' // posições 3-6: controle de lote (0000 = header de arquivo)
    header += '0' // posição 7: tipo de registro (0 = header)
    header += ' '.repeat(134) // posições 8-141: outros campos
    header += '1' // posição 142: código do arquivo (1 = remessa)
    header += ' '.repeat(20) // posições 143-162: outros campos
    header += '084' // posições 163-165: versão do layout
    header += ' '.repeat(74) // posições 166-239: resto do header
    return header
  }

  const createValidTrailer = (lineCount: number): string => {
    let trailer = '237' // posições 0-2: código do banco
    trailer += '9999' // posições 3-6: controle de lote (9999 = trailer de arquivo)
    trailer += '9' // posição 7: tipo de registro (9 = trailer)
    trailer += ' '.repeat(9) // posições 8-16: brancos/outros
    trailer += lineCount.toString().padStart(6, '0') // posições 17-22: quantidade de registros
    trailer += ' '.repeat(217) // posições 23-239: resto do trailer
    return trailer
  }

  describe('construtor', () => {
    test('aceita arquivo válido', () => {
      expect(() => new CnabFileBradesco240(fixtureLines)).not.toThrow()
    })

    test('identifica quantidade correta de boletos', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

      expect(doc.boletoCount).toBe(3)
    })
  })

  describe('getBoleto', () => {
    test('retorna instância de BoletoBradesco240', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

      const boleto = doc.getBoleto(0)

      expect(boleto).toBeInstanceOf(BoletoBradesco240)
    })

    test('tipo retornado é BoletoBradesco240 (type safety)', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

      const boleto = doc.getBoleto(0)
      const result = boleto.readSimple()

      expect(result.errors).toHaveLength(0)
      expect(result.data.nossoNumero).toBeDefined()
      expect(result.data.numeroDocumento).toBeDefined()
    })

    test('cada boleto pode ser lido individualmente', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

      const boleto0 = doc.getBoleto(0)
      const boleto1 = doc.getBoleto(1)
      const boleto2 = doc.getBoleto(2)

      expect(boleto0).toBeInstanceOf(BoletoBradesco240)
      expect(boleto1).toBeInstanceOf(BoletoBradesco240)
      expect(boleto2).toBeInstanceOf(BoletoBradesco240)
    })

    test('boleto retornado pode ser lido com sucesso', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

      const boleto = doc.getBoleto(0)
      const result = boleto.readSimple()

      expect(result.errors).toHaveLength(0)
      expect(result.data.nossoNumero).toBeTruthy()
      expect(result.data.valor).toBeGreaterThan(0)
      expect(result.data.vencimento).toBeInstanceOf(Date)
    })
  })

  describe('readAll', () => {
    test('processa todos os boletos do documento', () => {
      const doc = new CnabFileBradesco240(fixtureLines)

      const results = doc.readAll()

      expect(results).toHaveLength(3)
      expect(results.every(r => r.success)).toBe(true)
      expect(results[0].index).toBe(0)
      expect(results[1].index).toBe(1)
      expect(results[2].index).toBe(2)
    })
  })

  describe('arquivo sem boletos', () => {
    test('aceita arquivo com apenas header e trailer', () => {
      const header = createValidHeader()
      const trailer = createValidTrailer(2)

      const doc = new CnabFileBradesco240([header, trailer])

      expect(doc.boletoCount).toBe(0)
    })
  })

  describe('validação de literais do header', () => {
    const corruptHeader = (start: number, end: number, replacement: string): string => {
      const validHeader = createValidHeader()
      return validHeader.substring(0, start) + replacement.padEnd(end - start, ' ') + validHeader.substring(end)
    }

    test('rejeita código do banco inválido', () => {
      const header = corruptHeader(0, 3, '341')
      const trailer = createValidTrailer(2)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco240(lines)
      }).toThrow("campo 'código do banco' deve ser '237', encontrado '341'")
    })

    test('rejeita controle de lote inválido no header', () => {
      const header = corruptHeader(3, 7, '0001')
      const trailer = createValidTrailer(2)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco240(lines)
      }).toThrow("campo 'controle de lote (header de arquivo)' deve ser '0000', encontrado '0001'")
    })

    test('rejeita código do arquivo inválido', () => {
      const header = corruptHeader(142, 143, '2')
      const trailer = createValidTrailer(2)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco240(lines)
      }).toThrow("campo 'código do arquivo (remessa)' deve ser '1', encontrado '2'")
    })

    test('rejeita versão do layout inválida', () => {
      const header = corruptHeader(163, 166, '083')
      const trailer = createValidTrailer(2)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco240(lines)
      }).toThrow("campo 'versão do layout' deve ser '084', encontrado '083'")
    })
  })

  describe('validação de integridade do trailer', () => {
    test('rejeita código do banco inválido no trailer', () => {
      const header = createValidHeader()
      const trailer = '341' + '9999' + '9' + ' '.repeat(9) + '000002' + ' '.repeat(217)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco240(lines)
      }).toThrow("campo 'código do banco' deve ser '237', encontrado '341'")
    })

    test('rejeita controle de lote inválido no trailer', () => {
      const header = createValidHeader()
      const trailer = '237' + '9998' + '9' + ' '.repeat(9) + '000002' + ' '.repeat(217)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco240(lines)
      }).toThrow("campo 'controle de lote (trailer de arquivo)' deve ser '9999', encontrado '9998'")
    })

    test('aceita trailer válido', () => {
      const header = createValidHeader()
      const trailer = createValidTrailer(2)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco240(lines)
      }).not.toThrow()
    })
  })
})

