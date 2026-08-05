import { BoletoBradesco400 } from './boleto-bradesco-400'
import { BoletoBradesco400ComExtras } from './boleto-bradesco-400-com-extras.example'
import { ReadMode } from '@/types/core/read-mode'

describe('BoletoBradesco400 - ReadMode', () => {
  const createValidLines = (): string[] => {
    return [
      '100000000000000000000009000881234567425.159185.03             0002020009100010629P00000000002N           0  01NF82760-0324082600000022560930000000001N250526000000000000022560000000000000000000000000000000000000000000000220000000997330COMERCIAL ALFA LTDA                     AV EXEMPLO 200                                      29045402APOS 5 DIAS DE VENCIMENTO PROTESTAR!  REF NF(S): 082760  COB000002',
      '2APOS 5 DIAS DE VENCIMENTO PROTESTAR!                                                                                                                                                                                                                                                                                            00000000000000000000000000000000000000       009000690626370409100010629P000003'
    ]
  }

  describe('ReadMode.SIMPLE', () => {
    test('read com SIMPLE mode retorna apenas campos canônicos', () => {
      const boleto = new BoletoBradesco400ComExtras(createValidLines())

      const data = boleto.read(ReadMode.SIMPLE)

      expect(data.nossoNumero).toBe('09100010629')
      expect(data.valor).toBe(22560.93)
      expect(data.extra).toBeUndefined()
    })

    test('read com SIMPLE mode ignora campos extras mesmo se configurados', () => {
      const boleto = new BoletoBradesco400ComExtras(createValidLines())

      const data = boleto.read(ReadMode.SIMPLE)

      expect(data.extra).toBeUndefined()
    })
  })

  describe('ReadMode.SIMPLE (padrão)', () => {
    test('read sem mode usa SIMPLE por padrão', () => {
      const boleto = new BoletoBradesco400ComExtras(createValidLines())

      const data = boleto.read()

      expect(data.nossoNumero).toBe('09100010629')
      expect(data.extra).toBeUndefined()
    })

    test('read com FULL mode explícito inclui campos extras', () => {
      const boleto = new BoletoBradesco400ComExtras(createValidLines())

      const data = boleto.read(ReadMode.FULL)

      expect(data.nossoNumero).toBe('09100010629')
      expect(data.extra).toBeDefined()
      expect(data.extra!.codigoOcorrencia).toBe('01')
      expect(data.extra!.carteiraCodigo).toBe('009')
    })

    test('read com FULL mode em boleto sem extras não inclui propriedade extra', () => {
      const boleto = new BoletoBradesco400(createValidLines())

      const data = boleto.read(ReadMode.FULL)

      expect(data.nossoNumero).toBe('09100010629')
      expect(data.extra).toBeUndefined()
    })
  })

  describe('Equivalência', () => {
    test('read com SIMPLE é equivalente a readSimple', () => {
      const boleto = new BoletoBradesco400ComExtras(createValidLines())

      const simpleData = boleto.readSimple()
      const readSimpleData = boleto.read(ReadMode.SIMPLE)

      expect(simpleData).toEqual(readSimpleData)
    })

    test('read com FULL é equivalente a readFull', () => {
      const boleto = new BoletoBradesco400ComExtras(createValidLines())

      const fullData = boleto.readFull()
      const readFullData = boleto.read(ReadMode.FULL)

      expect(fullData).toEqual(readFullData)
    })
  })
})
