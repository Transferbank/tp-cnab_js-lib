import { BoletoBradesco400 } from './boleto-bradesco-400'
import { ReadMode } from '@/types/core/read-mode'
import { CNABFieldNotFoundError } from '@/types/errors/field-errors'

describe('BoletoBradesco400', () => {
  const createValidLines = (): string[] => {
    return [
      '100000000000000000000009000881234567425.159185.03             0002020009100010629P00000000002N           0  01NF82760-0324082600000022560930000000001N250526000000000000022560000000000000000000000000000000000000000000000220000000997330COMERCIAL ALFA LTDA                     AV EXEMPLO 200                                      29045402APOS 5 DIAS DE VENCIMENTO PROTESTAR!  REF NF(S): 082760  COB000002',
      '2APOS 5 DIAS DE VENCIMENTO PROTESTAR!                                                                                                                                                                                                                                                                                            00000000000000000000000000000000000000       009000690626370409100010629P000003'
    ]
  }

  describe('Validação no construtor', () => {
    test('aceita linhas válidas', () => {
      const rawContent = createValidLines()
      
      expect(() => new BoletoBradesco400(rawContent)).not.toThrow()
    })

    test('rejeita array vazio', () => {
      expect(() => new BoletoBradesco400([])).toThrow('boleto deve conter pelo menos uma linha')
    })

    test('rejeita linha com tamanho incorreto', () => {
      const invalidRawContent = ['linha curta']
      
      expect(() => new BoletoBradesco400(invalidRawContent)).toThrow('linha deve ter 400 caracteres')
    })

    test('rejeita primeira linha que não é detalhe tipo 1', () => {
      const invalidFirstLine = '0' + 'X'.repeat(399)
      
      expect(() => new BoletoBradesco400([invalidFirstLine])).toThrow(
        "primeira linha deve ser registro detalhe (tipo '1' ou '7')"
      )
    })

    test('aceita boleto com múltiplas linhas começando com tipo 1', () => {
      const line1 = '1' + 'X'.repeat(399)
      const line2 = '2' + 'Y'.repeat(399)
      
      expect(() => new BoletoBradesco400([line1, line2])).not.toThrow()
    })

    test('rejeita boleto começando com tipo header (0)', () => {
      const headerLine = '0' + '0'.repeat(399)
      const detailLine = '1' + 'X'.repeat(399)
      
      expect(() => new BoletoBradesco400([headerLine, detailLine])).toThrow(
        "primeira linha deve ser registro detalhe (tipo '1' ou '7')"
      )
    })
  })

  describe('readSimple()', () => {
    test('retorna apenas campos canônicos', () => {
      const boleto = new BoletoBradesco400(createValidLines())
      
      const data = boleto.readSimple()
      
      expect(data.nossoNumero).toBe('09100010629')
      expect(data.numeroDocumento).toBe('NF82760-03')
      expect(data.vencimento).toEqual(new Date(2026, 7, 24))
      expect(data.valor).toBe(22560.93)
      expect(data.dataEmissao).toEqual(new Date(2026, 4, 25))
      expect(data.sacado.documento).toBe('20000000997330')
      expect(data.sacado.nome).toBe('COMERCIAL ALFA LTDA')
      expect(data.sacado.endereco.cep).toBe('29045402')
      expect(data.extra).toBeUndefined()
    })
  })

  describe('readFull()', () => {
    test('retorna campos canônicos com extras', () => {
      const boleto = new BoletoBradesco400(createValidLines())
      
      const data = boleto.readFull()
      
      expect(data.nossoNumero).toBe('09100010629')
      expect(data.extra).toBeDefined()
      expect(data.extra!.codigoOcorrencia).toBe('01')
      expect(data.extra!.carteiraCodigo).toBe('009')
    })
  })

  describe('read(mode)', () => {
    test('ReadMode.SIMPLE retorna apenas canônicos', () => {
      const boleto = new BoletoBradesco400(createValidLines())
      
      const data = boleto.read(ReadMode.SIMPLE)
      
      expect(data.nossoNumero).toBe('09100010629')
      expect(data.extra).toBeUndefined()
    })

    test('ReadMode.FULL retorna com extras', () => {
      const boleto = new BoletoBradesco400(createValidLines())
      
      const data = boleto.read(ReadMode.FULL)
      
      expect(data.nossoNumero).toBe('09100010629')
      expect(data.extra!.codigoOcorrencia).toBe('01')
    })

    test('padrão é SIMPLE', () => {
      const boleto = new BoletoBradesco400(createValidLines())
      
      const data = boleto.read()
      
      expect(data.extra).toBeUndefined()
    })
  })

  describe('readField()', () => {
    test('lê campo individual', () => {
      const boleto = new BoletoBradesco400(createValidLines())
      
      expect(boleto.readField('nossoNumero')).toBe('09100010629')
      expect(boleto.readField('valor')).toBe(22560.93)
    })

    test('lança CNABFieldNotFoundError para campo inexistente', () => {
      const boleto = new BoletoBradesco400(createValidLines())
      
      expect(() => boleto.readField('campoInexistente' as any)).toThrow(CNABFieldNotFoundError)
      expect(() => boleto.readField('campoInexistente' as any)).toThrow('Campo "campoInexistente" não encontrado')
    })
  })

  describe('readExtraField()', () => {
    test('lê campo extra por key', () => {
      const boleto = new BoletoBradesco400(createValidLines())
      
      expect(boleto.readExtraField('codigoOcorrencia')).toBe('01')
    })

    test('lê campo extra por key alternativo', () => {
      const boleto = new BoletoBradesco400(createValidLines())
      
      expect(boleto.readExtraField('carteiraCodigo')).toBe('009')
    })

    test('lança CNABFieldNotFoundError para campo extra inexistente', () => {
      const boleto = new BoletoBradesco400(createValidLines())
      
      expect(() => boleto.readExtraField('campoInexistente')).toThrow(CNABFieldNotFoundError)
      expect(() => boleto.readExtraField('campoInexistente')).toThrow('Campo extra "campoInexistente" não encontrado')
    })
  })
})
