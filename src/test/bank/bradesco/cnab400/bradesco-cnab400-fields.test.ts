import * as path from 'path'
import { resPath } from '@test/conftest'
import { readExampleLines } from '@test/test-utils'
import { describe, it, expect } from '@jest/globals'
import * as Fields from '@cnab/bank/bradesco/cnab/cnab400/field/fields'

describe('Bradesco CNAB400 Fields - Header', (): void => {
  const lines = readExampleLines(path.join(resPath(), 'bradesco/cnab400/bradesco_cnab_400.txt'))
  const headerArquivo = lines[0]

  describe('Data de Geração', (): void => {
    it('dado Header Arquivo quando extrair então retorna 260526', (): void => {
      const field = new Fields.Cnab400BradescoHeaderDataGeracaoField({ rawLine: headerArquivo, lineNumber: 1 })
      expect(field.parse()).toBe('260526')
    })
    it('dado Header Arquivo válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab400BradescoHeaderDataGeracaoField({ rawLine: headerArquivo, lineNumber: 1 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado data inválida quando validar então isValid false', (): void => {
      const invalidLine = headerArquivo.substring(0, 94) + '999999' + headerArquivo.substring(100)
      const field = new Fields.Cnab400BradescoHeaderDataGeracaoField({ rawLine: invalidLine, lineNumber: 1 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })
})

describe('Bradesco CNAB400 Fields - Primeiro Boleto', (): void => {
  const lines = readExampleLines(path.join(resPath(), 'bradesco/cnab400/bradesco_cnab_400.txt'))
  const detalhe = lines[1]

  describe('Nosso Número', (): void => {
    it('dado Detalhe quando extrair então retorna 09100010629', (): void => {
      const field = new Fields.Cnab400BradescoBoletoNossoNumeroField({ rawLine: detalhe, lineNumber: 2 })
      expect(field.parse()).toBe('09100010629')
    })
    it('dado Detalhe válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab400BradescoBoletoNossoNumeroField({ rawLine: detalhe, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado nossoNumero com letras quando validar então isValid false', (): void => {
      const invalidLine = detalhe.substring(0, 70) + 'ABC45678901' + detalhe.substring(81)
      const field = new Fields.Cnab400BradescoBoletoNossoNumeroField({ rawLine: invalidLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Número Documento Emissor', (): void => {
    it('dado Detalhe quando extrair então retorna NF82760-03', (): void => {
      const field = new Fields.Cnab400BradescoBoletoNumeroDocumentoEmissorField({ rawLine: detalhe, lineNumber: 2 })
      expect(field.parse()).toBe('NF82760-03')
    })
    it('dado Detalhe válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab400BradescoBoletoNumeroDocumentoEmissorField({ rawLine: detalhe, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado numeroDocumentoEmissor vazio quando validar então isValid false', (): void => {
      const invalidLine = detalhe.substring(0, 110) + '          ' + detalhe.substring(120)
      const field = new Fields.Cnab400BradescoBoletoNumeroDocumentoEmissorField({ rawLine: invalidLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('CPF/CNPJ do Sacado', (): void => {
    it('dado Detalhe quando extrair então retorna 20000000997330', (): void => {
      const field = new Fields.Cnab400BradescoBoletoSacadoDocumentoField({ rawLine: detalhe, lineNumber: 2 })
      expect(field.parse()).toBe('20000000997330')
    })
    it('dado CNPJ válido quando validar então isValid true', (): void => {
      const validLine = detalhe.substring(0, 220) + '00000000000191' + detalhe.substring(234)
      const field = new Fields.Cnab400BradescoBoletoSacadoDocumentoField({ rawLine: validLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado documento inválido quando validar então isValid false', (): void => {
      const invalidLine = detalhe.substring(0, 220) + '0000000000000' + detalhe.substring(234)
      const field = new Fields.Cnab400BradescoBoletoSacadoDocumentoField({ rawLine: invalidLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Nome do Pagador', (): void => {
    it('dado Detalhe quando extrair então retorna COMERCIAL ALFA LTDA', (): void => {
      const field = new Fields.Cnab400BradescoBoletoNameField({ rawLine: detalhe, lineNumber: 2 })
      expect(field.parse()).toBe('COMERCIAL ALFA LTDA')
    })
    it('dado Detalhe válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab400BradescoBoletoNameField({ rawLine: detalhe, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado nome com menos de 3 caracteres quando validar então isValid false', (): void => {
      const invalidLine = detalhe.substring(0, 234) + ' '.repeat(40) + detalhe.substring(274)
      const field = new Fields.Cnab400BradescoBoletoNameField({ rawLine: invalidLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Valor do Título', (): void => {
    it('dado Detalhe quando extrair então retorna 22560.93', (): void => {
      const field = new Fields.Cnab400BradescoBoletoValorTituloField({ rawLine: detalhe, lineNumber: 2 })
      expect(field.parse()).toBe('22560.93')
    })
    it('dado Detalhe válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab400BradescoBoletoValorTituloField({ rawLine: detalhe, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado valor com letras quando validar então isValid false', (): void => {
      const invalidLine = detalhe.substring(0, 126) + '00000000AB093' + detalhe.substring(139)
      const field = new Fields.Cnab400BradescoBoletoValorTituloField({ rawLine: invalidLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })
  
  describe('Vencimento', (): void => {
    it('dado Detalhe quando extrair então retorna 240826', (): void => {
      const field = new Fields.Cnab400BradescoBoletoVencimentoField({ rawLine: detalhe, lineNumber: 2 })
      expect(field.parse()).toBe('240826')
    })
    it('dado Detalhe válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab400BradescoBoletoVencimentoField({ rawLine: detalhe, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado data inválida quando validar então isValid false', (): void => {
      const invalidLine = detalhe.substring(0, 120) + '999999' + detalhe.substring(126)
      const field = new Fields.Cnab400BradescoBoletoVencimentoField({ rawLine: invalidLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Data Emissão', (): void => {
    it('dado Detalhe quando extrair então retorna 250526', (): void => {
      const field = new Fields.Cnab400BradescoBoletoDataEmissaoField({ rawLine: detalhe, lineNumber: 2 })
      expect(field.parse()).toBe('250526')
    })
    it('dado Detalhe válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab400BradescoBoletoDataEmissaoField({ rawLine: detalhe, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado data inválida quando validar então isValid false', (): void => {
      const invalidLine = detalhe.substring(0, 150) + '999999' + detalhe.substring(156)
      const field = new Fields.Cnab400BradescoBoletoDataEmissaoField({ rawLine: invalidLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Multa', (): void => {
    it('dado Detalhe quando extrair então retorna 2.00', (): void => {
      const field = new Fields.Cnab400BradescoBoletoMultaField({ rawLine: detalhe, lineNumber: 2 })
      expect(field.parse()).toBe('2.00')
    })
    it('dado Detalhe válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab400BradescoBoletoMultaField({ rawLine: detalhe, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado indicador inválido quando validar então isValid false', (): void => {
      const invalidLine = detalhe.substring(0, 65) + '9000' + detalhe.substring(69)
      const field = new Fields.Cnab400BradescoBoletoMultaField({ rawLine: invalidLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Desconto Data', (): void => {
    it('dado Detalhe quando extrair então retorna 000000', (): void => {
      const field = new Fields.Cnab400BradescoBoletoDescontoDataField({ rawLine: detalhe, lineNumber: 2 })
      expect(field.parse()).toBe('000000')
    })
    it('dado Detalhe válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab400BradescoBoletoDescontoDataField({ rawLine: detalhe, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado data com formato inválido quando validar então isValid false', (): void => {
      const invalidLine = detalhe.substring(0, 173) + 'ABCDEF' + detalhe.substring(179)
      const field = new Fields.Cnab400BradescoBoletoDescontoDataField({ rawLine: invalidLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Desconto Valor', (): void => {
    it('dado Detalhe quando extrair então retorna 0.00', (): void => {
      const field = new Fields.Cnab400BradescoBoletoDescontoValorField({ rawLine: detalhe, lineNumber: 2 })
      expect(field.parse()).toBe('0.00')
    })
    it('dado Detalhe válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab400BradescoBoletoDescontoValorField({ rawLine: detalhe, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado valor com letras quando validar então isValid false', (): void => {
      const invalidLine = detalhe.substring(0, 179) + '000000000ABC00' + detalhe.substring(193)
      const field = new Fields.Cnab400BradescoBoletoDescontoValorField({ rawLine: invalidLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('Abatimento', (): void => {
    it('dado Detalhe quando extrair então retorna 0.00', (): void => {
      const field = new Fields.Cnab400BradescoBoletoAbatimentoField({ rawLine: detalhe, lineNumber: 2 })
      expect(field.parse()).toBe('0.00')
    })
    it('dado Detalhe válido quando validar então isValid true', (): void => {
      const field = new Fields.Cnab400BradescoBoletoAbatimentoField({ rawLine: detalhe, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
    it('dado valor com letras quando validar então isValid false', (): void => {
      const invalidLine = detalhe.substring(0, 194) + '000000000XYZ00' + detalhe.substring(208)
      const field = new Fields.Cnab400BradescoBoletoAbatimentoField({ rawLine: invalidLine, lineNumber: 2 })
      const result = field.validate()
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
    })
  })
})
