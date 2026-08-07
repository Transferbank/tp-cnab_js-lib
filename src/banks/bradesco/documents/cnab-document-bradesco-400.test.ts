import { CnabDocumentBradesco400 } from './cnab-document-bradesco-400'
import { BoletoBradesco400 } from '@/banks/bradesco/boletos/boleto-bradesco-400'

describe('CnabDocumentBradesco400', () => {
  const createValidLines = (): string[] => {
    return [
      '100000000000000000000009000881234567425.159185.03             0002020009100010629P00000000002N           0  01NF82760-0324082600000022560930000000001N250526000000000000022560000000000000000000000000000000000000000000000220000000997330COMERCIAL ALFA LTDA                     AV EXEMPLO 200                                      29045402APOS 5 DIAS DE VENCIMENTO PROTESTAR!  REF NF(S): 082760  COB000002',
      '2APOS 5 DIAS DE VENCIMENTO PROTESTAR!                                                                                                                                                                                                                                                                                            00000000000000000000000000000000000000       009000690626370409100010629P000003'
    ]
  }

  const createValidDocument = (): string[] => {
    const header = '0' + '0'.repeat(399)
    const trailer = '9' + '9'.repeat(399)
    
    const boleto1Lines = createValidLines()
    const boleto2Line = '100000000000000000000009000881234568525.159185.04             0002020009100010630P00000000003N           0  01NF82761-0324082600000033560930000000002N250526000000000000033560000000000000000000000000000000000000000000000220000000997330COMERCIAL BETA LTDA                     AV EXEMPLO 300                                      29045402APOS 5 DIAS DE VENCIMENTO PROTESTAR!  REF NF(S): 082761  COB000003'
    
    return [header, ...boleto1Lines, boleto2Line, trailer]
  }

  describe('construtor', () => {
    test('aceita arquivo válido', () => {
      const lines = createValidDocument()
      
      expect(() => {
        new CnabDocumentBradesco400(lines, BoletoBradesco400)
      }).not.toThrow()
    })

    test('identifica quantidade correta de boletos', () => {
      const lines = createValidDocument()
      const doc = new CnabDocumentBradesco400(lines, BoletoBradesco400)
      
      expect(doc.boletoCount).toBe(2)
    })
  })

  describe('getBoleto', () => {
    test('retorna instância de BoletoBradesco400', () => {
      const lines = createValidDocument()
      const doc = new CnabDocumentBradesco400(lines, BoletoBradesco400)
      
      const boleto = doc.getBoleto(0)
      expect(boleto).toBeInstanceOf(BoletoBradesco400)
    })

    test('tipo retornado é BoletoBradesco400 (type safety)', () => {
      const lines = createValidDocument()
      const doc = new CnabDocumentBradesco400(lines, BoletoBradesco400)
      
      const boleto = doc.getBoleto(0)
      
      expect(boleto.readSimple).toBeDefined()
      expect(boleto.readFull).toBeDefined()
      expect(typeof boleto.readSimple).toBe('function')
      expect(typeof boleto.readFull).toBe('function')
    })

    test('cada boleto pode ser lido individualmente', () => {
      const lines = createValidDocument()
      const doc = new CnabDocumentBradesco400(lines, BoletoBradesco400)
      
      const boleto0 = doc.getBoleto(0)
      const boleto1 = doc.getBoleto(1)
      
      expect(boleto0).toBeInstanceOf(BoletoBradesco400)
      expect(boleto1).toBeInstanceOf(BoletoBradesco400)
      expect(boleto0).not.toBe(boleto1)
    })

    test('boleto retornado pode ser lido com sucesso', () => {
      const lines = createValidDocument()
      const doc = new CnabDocumentBradesco400(lines, BoletoBradesco400)
      
      const boleto = doc.getBoleto(0)
      const data = boleto.read()
      
      expect(data.numeroDocumento).toBe('NF82760-03')
      expect(data.nossoNumero).toBe('09100010629')
    })
  })

  describe('arquivo com um único boleto', () => {
    test('processa boleto simples sem satélites', () => {
      const header = '0' + '0'.repeat(399)
      const trailer = '9' + '9'.repeat(399)
      const boletoLine = '100000000000000000000009000881234567425.159185.03             0002020009100010629P00000000002N           0  01NF82760-0324082600000022560930000000001N250526000000000000022560000000000000000000000000000000000000000000000220000000997330COMERCIAL ALFA LTDA                     AV EXEMPLO 200                                      29045402APOS 5 DIAS DE VENCIMENTO PROTESTAR!  REF NF(S): 082760  COB000002'
      
      const lines = [header, boletoLine, trailer]
      const doc = new CnabDocumentBradesco400(lines, BoletoBradesco400)
      
      expect(doc.boletoCount).toBe(1)
      
      const boleto = doc.getBoleto(0)
      const data = boleto.read()
      expect(data.numeroDocumento).toBe('NF82760-03')
    })
  })

  describe('readAll', () => {
    test('processa todos os boletos do documento', () => {
      const lines = createValidDocument()
      const doc = new CnabDocumentBradesco400(lines, BoletoBradesco400)
      
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
      const header = '0' + '0'.repeat(399)
      const trailer = '9' + '9'.repeat(399)
      const lines = [header, trailer]
      
      const doc = new CnabDocumentBradesco400(lines, BoletoBradesco400)
      
      expect(doc.boletoCount).toBe(0)
      expect(doc.readAll()).toEqual([])
    })
  })
})
