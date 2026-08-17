import * as path from 'path'
import { describe, it, expect } from '@jest/globals'
import { resPath } from '@test/conftest'
import { readExampleLines } from '@test/test-utils'
import * as Fields from '@cnab/bank/bradesco/fields/cnab240/fields'
describe('Bradesco CNAB240 Fields - Primeiro Boleto', (): void => {
  const lines = readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt'))
  const segmentoP = lines[2]
  const segmentoQ = lines[3]

  describe('Nosso Número', (): void => {
    it('dado Segmento P quando extrair então retorna 0000123450010', (): void => {
      const field = new Fields.Cnab240BradescoBoletoNossoNumeroField({ rawLine: segmentoP, lineNumber: 3 })
      expect(field.parse()).toBe('0000123450010')
    })
    it('dado Segmento P válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoNossoNumeroField({ rawLine: segmentoP, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado nossoNumero com letras quando validar então isValid false', (): void => {
      const invalidLine = segmentoP.substring(0, 44) + 'ABC1234567890' + segmentoP.substring(57)
      const field = new Fields.Cnab240BradescoBoletoNossoNumeroField({ rawLine: invalidLine, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })
  describe('Número Documento Emissor', (): void => {
    it('dado Segmento P quando extrair então retorna NF0000123', (): void => {
      const field = new Fields.Cnab240BradescoBoletoNumeroDocumentoEmissorField({ rawLine: segmentoP, lineNumber: 3 })
      expect(field.parse()).toBe('NF0000123')
    })
    it('dado Segmento P válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoNumeroDocumentoEmissorField({ rawLine: segmentoP, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado numeroDocumentoEmissor vazio quando validar então isValid false', (): void => {
      const invalidLine = segmentoP.substring(0, 62) + '               ' + segmentoP.substring(77)
      const field = new Fields.Cnab240BradescoBoletoNumeroDocumentoEmissorField({ rawLine: invalidLine, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })
  describe('CPF/CNPJ do Sacado', (): void => {
    it('dado Segmento Q quando extrair então retorna 000010000791989', (): void => {
      const field = new Fields.Cnab240BradescoBoletoSacadoDocumentoField({ rawLine: segmentoQ, lineNumber: 4 })
      expect(field.parse()).toBe('000010000791989')
    })
    it('dado CPF válido quando validar então isValid true', (): void => {
      const validLine = segmentoQ.substring(0, 18) + '000012345678909' + segmentoQ.substring(33)
      const field = new Fields.Cnab240BradescoBoletoSacadoDocumentoField({ rawLine: validLine, lineNumber: 4 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado documento inválido quando validar então isValid false', (): void => {
      const invalidLine = segmentoQ.substring(0, 18) + '000000000000000' + segmentoQ.substring(33)
      const field = new Fields.Cnab240BradescoBoletoSacadoDocumentoField({ rawLine: invalidLine, lineNumber: 4 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })
  describe('Nome do Pagador', (): void => {
    it('dado Segmento Q quando extrair então retorna JOAO EXEMPLO SILVA', (): void => {
      const field = new Fields.Cnab240BradescoBoletoNameField({ rawLine: segmentoQ, lineNumber: 4 })
      expect(field.parse()).toBe('JOAO EXEMPLO SILVA')
    })
    it('dado Segmento Q válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoNameField({ rawLine: segmentoQ, lineNumber: 4 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado nome com menos de 3 caracteres quando validar então isValid false', (): void => {
      const invalidLine = segmentoQ.substring(0, 33) + ' '.repeat(40) + segmentoQ.substring(73)
      const field = new Fields.Cnab240BradescoBoletoNameField({ rawLine: invalidLine, lineNumber: 4 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })
  describe('Valor do Título', (): void => {
    it('dado Segmento P quando extrair então retorna 100.00', (): void => {
      const field = new Fields.Cnab240BradescoBoletoValorTituloField({ rawLine: segmentoP, lineNumber: 3 })
      expect(field.parse()).toBe('100.00')
    })
    it('dado Segmento P válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoValorTituloField({ rawLine: segmentoP, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado valor com letras quando validar então isValid false', (): void => {
      const invalidLine = segmentoP.substring(0, 85) + '00000000001000AB' + segmentoP.substring(101)
      const field = new Fields.Cnab240BradescoBoletoValorTituloField({ rawLine: invalidLine, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })
  describe('Vencimento', (): void => {
    it('dado Segmento P quando extrair então retorna 15122026', (): void => {
      const field = new Fields.Cnab240BradescoBoletoVencimentoField({ rawLine: segmentoP, lineNumber: 3 })
      expect(field.parse()).toBe('15122026')
    })
    it('dado Segmento P válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoVencimentoField({ rawLine: segmentoP, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado data inválida quando validar então isValid false', (): void => {
      const invalidLine = segmentoP.substring(0, 77) + '99999999' + segmentoP.substring(85)
      const field = new Fields.Cnab240BradescoBoletoVencimentoField({ rawLine: invalidLine, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })
  describe('Data Emissão', (): void => {
    it('dado Segmento P quando extrair então retorna 01122026', (): void => {
      const field = new Fields.Cnab240BradescoBoletoDataEmissaoField({ rawLine: segmentoP, lineNumber: 3 })
      expect(field.parse()).toBe('01122026')
    })
    it('dado Segmento P válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoDataEmissaoField({ rawLine: segmentoP, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado data inválida quando validar então isValid false', (): void => {
      const invalidLine = segmentoP.substring(0, 109) + '99999999' + segmentoP.substring(117)
      const field = new Fields.Cnab240BradescoBoletoDataEmissaoField({ rawLine: invalidLine, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Desconto Data', (): void => {
    it('dado Segmento P quando extrair então retorna 00000000', (): void => {
      const field = new Fields.Cnab240BradescoBoletoDescontoDataField({ rawLine: segmentoP, lineNumber: 3 })
      expect(field.parse()).toBe('00000000')
    })
    it('dado Segmento P válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoDescontoDataField({ rawLine: segmentoP, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado data com formato inválido quando validar então isValid false', (): void => {
      const invalidLine = segmentoP.substring(0, 117) + 'ABCDEFGH' + segmentoP.substring(125)
      const field = new Fields.Cnab240BradescoBoletoDescontoDataField({ rawLine: invalidLine, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Desconto Valor', (): void => {
    it('dado Segmento P quando extrair então retorna 0.00', (): void => {
      const field = new Fields.Cnab240BradescoBoletoDescontoValorField({ rawLine: segmentoP, lineNumber: 3 })
      expect(field.parse()).toBe('0.00')
    })
    it('dado Segmento P válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoDescontoValorField({ rawLine: segmentoP, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado valor com letras quando validar então isValid false', (): void => {
      const invalidLine = segmentoP.substring(0, 150) + '00000000ABC0000' + segmentoP.substring(165)
      const field = new Fields.Cnab240BradescoBoletoDescontoValorField({ rawLine: invalidLine, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Abatimento', (): void => {
    it('dado Segmento P quando extrair então retorna 0.00', (): void => {
      const field = new Fields.Cnab240BradescoBoletoAbatimentoField({ rawLine: segmentoP, lineNumber: 3 })
      expect(field.parse()).toBe('0.00')
    })
    it('dado Segmento P válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoAbatimentoField({ rawLine: segmentoP, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado valor com letras quando validar então isValid false', (): void => {
      const invalidLine = segmentoP.substring(0, 180) + '00000000XYZ0000' + segmentoP.substring(195)
      const field = new Fields.Cnab240BradescoBoletoAbatimentoField({ rawLine: invalidLine, lineNumber: 3 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })
})

describe('Bradesco CNAB240 Fields - Multa (Segmento R)', (): void => {
  const lines = readExampleLines(path.join(resPath(), 'bradesco/cnab240/bradesco_cnab_240.txt'))
  const segmentoR = lines[4]

  describe('Multa Código', (): void => {
    it('dado Segmento R quando extrair então retorna percentual', (): void => {
      const field = new Fields.Cnab240BradescoBoletoMultaCodigoField({ rawLine: segmentoR, lineNumber: 5 })
      expect(field.parse()).toBe('percentual')
    })
    it('dado Segmento R válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoMultaCodigoField({ rawLine: segmentoR, lineNumber: 5 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado código inválido quando validar então isValid false', (): void => {
      const invalidLine = segmentoR.substring(0, 65) + '9' + segmentoR.substring(66)
      const field = new Fields.Cnab240BradescoBoletoMultaCodigoField({ rawLine: invalidLine, lineNumber: 5 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Multa Data', (): void => {
    it('dado Segmento R quando extrair então retorna 15122026', (): void => {
      const field = new Fields.Cnab240BradescoBoletoMultaDataField({ rawLine: segmentoR, lineNumber: 5 })
      expect(field.parse()).toBe('15122026')
    })
    it('dado Segmento R válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoMultaDataField({ rawLine: segmentoR, lineNumber: 5 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado data com formato inválido quando validar então isValid false', (): void => {
      const invalidLine = segmentoR.substring(0, 66) + 'ABCDEFGH' + segmentoR.substring(74)
      const field = new Fields.Cnab240BradescoBoletoMultaDataField({ rawLine: invalidLine, lineNumber: 5 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Multa Valor', (): void => {
    it('dado Segmento R quando extrair então retorna 2.00', (): void => {
      const field = new Fields.Cnab240BradescoBoletoMultaValorField({ rawLine: segmentoR, lineNumber: 5 })
      expect(field.parse()).toBe('2.00')
    })
    it('dado Segmento R válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab240BradescoBoletoMultaValorField({ rawLine: segmentoR, lineNumber: 5 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado valor com letras quando validar então isValid false', (): void => {
      const invalidLine = segmentoR.substring(0, 74) + '00000000ABC00' + segmentoR.substring(87)
      const field = new Fields.Cnab240BradescoBoletoMultaValorField({ rawLine: invalidLine, lineNumber: 5 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })
})
