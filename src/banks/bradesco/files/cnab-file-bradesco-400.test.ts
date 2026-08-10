import { CnabFileBradesco400 } from './cnab-file-bradesco-400'
import { BoletoBradesco400 } from '@/banks/bradesco/boletos/boleto-bradesco-400'

describe('CnabFileBradesco400', () => {
  const createValidLines = (): string[] => {
    return [
      '100000000000000000000009000881234567425.159185.03             0002020009100010629P00000000002N           0  01NF82760-0324082600000022560930000000001N250526000000000000022560000000000000000000000000000000000000000000000220000000997330COMERCIAL ALFA LTDA                     AV EXEMPLO 200                                      29045402APOS 5 DIAS DE VENCIMENTO PROTESTAR!  REF NF(S): 082760  COB000002',
      '2APOS 5 DIAS DE VENCIMENTO PROTESTAR!                                                                                                                                                                                                                                                                                            00000000000000000000000000000000000000       009000690626370409100010629P000003'
    ]
  }

  const createValidHeader = (): string => {
    // Posições 0-indexadas conforme HEADER_LITERALS + código banco posições 76-79
    let header = '0' // posição 0: tipo de registro
    header += '1' // posição 1: identificação arquivo-remessa
    header += 'REMESSA' // posições 2-8: literal remessa
    header += '01' // posições 9-10: código de serviço
    header += 'COBRANCA       ' // posições 11-25: literal serviço (15 chars)
    header += ' '.repeat(50) // posições 26-75: espaços até código do banco
    header += '237' // posições 76-78: código do banco (Bradesco = 237)
    header += 'BRADESCO       ' // posições 79-93: nome do banco (15 chars)
    header += ' '.repeat(300) // posições 94-393: resto do header
    header += '000001' // posições 394-399: número sequencial
    return header
  }

  const createValidDocument = (): string[] => {
    const header = createValidHeader()
    const trailer = '9' + '9'.repeat(399)
    
    const boleto1Lines = createValidLines()
    const boleto2Line = '100000000000000000000009000881234568525.159185.04             0002020009100010630P00000000003N           0  01NF82761-0324082600000033560930000000002N250526000000000000033560000000000000000000000000000000000000000000000220000000997330COMERCIAL BETA LTDA                     AV EXEMPLO 300                                      29045402APOS 5 DIAS DE VENCIMENTO PROTESTAR!  REF NF(S): 082761  COB000003'
    
    return [header, ...boleto1Lines, boleto2Line, trailer]
  }

  describe('construtor', () => {
    test('aceita arquivo válido', () => {
      const lines = createValidDocument()
      
      expect(() => {
        new CnabFileBradesco400(lines)
      }).not.toThrow()
    })

    test('identifica quantidade correta de boletos', () => {
      const lines = createValidDocument()
      const doc = new CnabFileBradesco400(lines)
      
      expect(doc.boletoCount).toBe(2)
    })
  })

  describe('getBoleto', () => {
    test('retorna instância de BoletoBradesco400', () => {
      const lines = createValidDocument()
      const doc = new CnabFileBradesco400(lines)
      
      const boleto = doc.getBoleto(0)
      expect(boleto).toBeInstanceOf(BoletoBradesco400)
    })

    test('tipo retornado é BoletoBradesco400 (type safety)', () => {
      const lines = createValidDocument()
      const doc = new CnabFileBradesco400(lines)
      
      const boleto = doc.getBoleto(0)
      
      expect(boleto.readSimple).toBeDefined()
      expect(boleto.readFull).toBeDefined()
      expect(typeof boleto.readSimple).toBe('function')
      expect(typeof boleto.readFull).toBe('function')
    })

    test('cada boleto pode ser lido individualmente', () => {
      const lines = createValidDocument()
      const doc = new CnabFileBradesco400(lines)
      
      const boleto0 = doc.getBoleto(0)
      const boleto1 = doc.getBoleto(1)
      
      expect(boleto0).toBeInstanceOf(BoletoBradesco400)
      expect(boleto1).toBeInstanceOf(BoletoBradesco400)
      expect(boleto0).not.toBe(boleto1)
    })

    test('boleto retornado pode ser lido com sucesso', () => {
      const lines = createValidDocument()
      const doc = new CnabFileBradesco400(lines)
      
      const boleto = doc.getBoleto(0)
      const result = boleto.read()
      
      expect(result.errors).toHaveLength(0)
      expect(result.data.numeroDocumento).toBe('NF82760-03')
      expect(result.data.nossoNumero).toBe('09100010629')
    })
  })

  describe('arquivo com um único boleto', () => {
    test('processa boleto simples sem satélites', () => {
      const header = createValidHeader()
      const trailer = '9' + '9'.repeat(399)
      const boletoLine = '100000000000000000000009000881234567425.159185.03             0002020009100010629P00000000002N           0  01NF82760-0324082600000022560930000000001N250526000000000000022560000000000000000000000000000000000000000000000220000000997330COMERCIAL ALFA LTDA                     AV EXEMPLO 200                                      29045402APOS 5 DIAS DE VENCIMENTO PROTESTAR!  REF NF(S): 082760  COB000002'
      
      const lines = [header, boletoLine, trailer]
      const doc = new CnabFileBradesco400(lines)
      
      expect(doc.boletoCount).toBe(1)
      
      const boleto = doc.getBoleto(0)
      const result = boleto.read()
      expect(result.errors).toHaveLength(0)
      expect(result.data.numeroDocumento).toBe('NF82760-03')
    })
  })

  describe('readAll', () => {
    test('processa todos os boletos do documento', () => {
      const lines = createValidDocument()
      const doc = new CnabFileBradesco400(lines)
      
      const results = doc.readAll()
      
      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[0].index).toBe(0)
      expect(results[0].data).toBeDefined()
      expect(results[1].success).toBe(true)
      expect(results[1].index).toBe(1)
      expect(results[1].data).toBeDefined()
    })
  })

  describe('arquivo sem boletos', () => {
    test('aceita arquivo com apenas header e trailer', () => {
      const header = createValidHeader()
      const trailer = '9' + '9'.repeat(399)
      const lines = [header, trailer]
      
      const doc = new CnabFileBradesco400(lines)
      
      expect(doc.boletoCount).toBe(0)
      expect(doc.readAll()).toEqual([])
    })
  })

  describe('validação de literais do header', () => {
    const corruptHeader = (start: number, end: number, replacement: string): string => {
      const validHeader = createValidHeader()
      return validHeader.substring(0, start) + replacement.padEnd(end - start, ' ') + validHeader.substring(end)
    }

    test('rejeita identificação de arquivo-remessa inválida', () => {
      const header = corruptHeader(1, 2, '0')
      const trailer = '9' + '9'.repeat(399)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco400(lines)
      }).toThrow("header: identificação do arquivo-remessa deve ser '1', encontrado '0'")
    })

    test('rejeita literal remessa inválido', () => {
      const header = corruptHeader(2, 9, 'RETORNO')
      const trailer = '9' + '9'.repeat(399)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco400(lines)
      }).toThrow("header: literal remessa deve ser 'REMESSA', encontrado 'RETORNO'")
    })

    test('rejeita código de serviço inválido', () => {
      const header = corruptHeader(9, 11, '02')
      const trailer = '9' + '9'.repeat(399)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco400(lines)
      }).toThrow("header: código de serviço deve ser '01', encontrado '02'")
    })

    test('rejeita literal serviço inválido', () => {
      const header = corruptHeader(11, 26, 'PAGAMENTO')
      const trailer = '9' + '9'.repeat(399)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco400(lines)
      }).toThrow("header: literal serviço deve ser 'COBRANCA', encontrado 'PAGAMENTO'")
    })

    test('rejeita nome do banco inválido', () => {
      const header = corruptHeader(79, 94, 'ITAU')
      const trailer = '9' + '9'.repeat(399)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco400(lines)
      }).toThrow("header: nome do banco por extenso deve ser 'BRADESCO', encontrado 'ITAU'")
    })

    test('rejeita número sequencial de registro inválido', () => {
      const header = corruptHeader(394, 400, '000002')
      const trailer = '9' + '9'.repeat(399)
      const lines = [header, trailer]

      expect(() => {
        new CnabFileBradesco400(lines)
      }).toThrow("header: número sequencial do registro deve ser '000001', encontrado '000002'")
    })
  })
})

