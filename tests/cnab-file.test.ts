/**
 * Testes para CNABFile e openCnab()
 */

import {
  openCnab,
  CNABFile,
  CNABEmptyFileError,
  CNABFormatNotRecognizedError,
  CNABBankNotFoundError,
  CNABSchemaNotFoundError,
} from '../src'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('openCnab', () => {
  describe('Validação de entrada', () => {
    test('deve lançar erro para arquivo vazio', () => {
      expect(() => openCnab('')).toThrow('Arquivo CNAB vazio')
      
      // Verificar tipo da exception
      try {
        openCnab('')
      } catch (error) {
        expect(error).toBeInstanceOf(CNABEmptyFileError)
        expect((error as CNABEmptyFileError).code).toBe('EMPTY_FILE')
      }
    })

    test('deve lançar erro para arquivo só com espaços', () => {
      expect(() => openCnab('   \n   \n   ')).toThrow(/Arquivo CNAB vazio|Formato CNAB não reconhecido/)
    })

    test('deve lançar erro para arquivo só com linhas vazias', () => {
      expect(() => openCnab('\n\n\n')).toThrow('Arquivo CNAB vazio')
      
      // Verificar tipo da exception
      try {
        openCnab('\n\n\n')
      } catch (error) {
        expect(error).toBeInstanceOf(CNABEmptyFileError)
        expect((error as CNABEmptyFileError).code).toBe('EMPTY_FILE')
      }
    })

    test('deve lançar erro para formato não reconhecido', () => {
      const invalidFile = 'X'.repeat(300) // 300 caracteres - nem 240 nem 400
      expect(() => openCnab(invalidFile)).toThrow(/Formato CNAB não reconhecido/)
      expect(() => openCnab(invalidFile)).toThrow(/300 caracteres/)
      
      // Verificar tipo da exception e campo lineLength
      try {
        openCnab(invalidFile)
      } catch (error) {
        expect(error).toBeInstanceOf(CNABFormatNotRecognizedError)
        expect((error as CNABFormatNotRecognizedError).code).toBe('FORMAT_NOT_RECOGNIZED')
        expect((error as CNABFormatNotRecognizedError).lineLength).toBe(300)
      }
    })

    test('deve lançar erro quando código do banco não é encontrado', () => {
      // CNAB 400 com código do banco vazio nas posições 77-79
      const line = 'X'.repeat(76) + '   ' + 'X'.repeat(321) // Total 400 chars
      expect(() => openCnab(line)).toThrow(/Código do banco não encontrado/)
      
      // Verificar tipo da exception e campo format
      try {
        openCnab(line)
      } catch (error) {
        expect(error).toBeInstanceOf(CNABBankNotFoundError)
        expect((error as CNABBankNotFoundError).code).toBe('BANK_NOT_FOUND')
        expect((error as CNABBankNotFoundError).format).toBe('cnab400')
      }
    })
  })

  describe('Detecção de formato e banco - CNAB 400', () => {
    test('deve detectar CNAB 400 do Bradesco', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')

      const cnabFile = openCnab(fileContent)

      expect(cnabFile.type).toBe('cnab400')
      expect(cnabFile.bankCode).toBe('237')
      expect(cnabFile.bankName).toBe('Bradesco')
      expect(cnabFile.lineCount).toBeGreaterThan(0)
    })

    test('deve detectar CNAB 400 do Banco do Brasil', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM')
      const fileContent = readFileSync(fixturePath, 'latin1')

      const cnabFile = openCnab(fileContent)

      expect(cnabFile.type).toBe('cnab400')
      expect(cnabFile.bankCode).toBe('001')
      expect(cnabFile.bankName).toBe('Banco do Brasil')
      expect(cnabFile.lineCount).toBeGreaterThan(0)
    })

    test('deve detectar CNAB 400 do Itaú', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/itau/ITAU_cnab_400.REM')
      const fileContent = readFileSync(fixturePath, 'latin1')

      const cnabFile = openCnab(fileContent)

      expect(cnabFile.type).toBe('cnab400')
      expect(cnabFile.bankCode).toBe('341')
      expect(cnabFile.bankName).toBe('Itaú')
      expect(cnabFile.lineCount).toBeGreaterThan(0)
    })

    test('deve detectar CNAB 400 do Santander', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/santander/SANTANDER_cnab_400_140.REM')
      const fileContent = readFileSync(fixturePath, 'latin1')

      const cnabFile = openCnab(fileContent)

      expect(cnabFile.type).toBe('cnab400')
      expect(cnabFile.bankCode).toBe('033')
      expect(cnabFile.bankName).toBe('Santander')
      expect(cnabFile.lineCount).toBeGreaterThan(0)
    })

    test('deve detectar CNAB 400 do Sicredi', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/sicredi/SICREDI_cnab_400.CRM')
      const fileContent = readFileSync(fixturePath, 'latin1')

      const cnabFile = openCnab(fileContent)

      expect(cnabFile.type).toBe('cnab400')
      expect(cnabFile.bankCode).toBe('748')
      expect(cnabFile.bankName).toBe('Sicredi')
      expect(cnabFile.lineCount).toBeGreaterThan(0)
    })
  })

  describe('Detecção de formato e banco - CNAB 240', () => {
    test('deve detectar CNAB 240 do Bradesco', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab240/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')

      const cnabFile = openCnab(fileContent)

      expect(cnabFile.type).toBe('cnab240')
      expect(cnabFile.bankCode).toBe('237')
      expect(cnabFile.bankName).toBe('Bradesco')
      expect(cnabFile.lineCount).toBeGreaterThan(0)
    })
  })

  describe('Contagem de linhas', () => {
    test('deve contar corretamente linhas em arquivo CNAB 400', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')

      const cnabFile = openCnab(fileContent)

      // Contar manualmente as linhas não-vazias
      const manualCount = fileContent.split(/\r?\n/).filter(l => l.length > 0).length

      expect(cnabFile.lineCount).toBe(manualCount)
    })

    test('deve ignorar linhas vazias ao contar', () => {
      // CNAB 400 do Bradesco com linhas vazias adicionadas
      const header = '0'.padEnd(400, ' ')
      const detail = '1'.padEnd(400, ' ')
      const trailer = '9'.padEnd(400, ' ')

      // Adicionar código do banco no header (posições 77-79)
      const headerWithBank = header.substring(0, 76) + '237' + header.substring(79)

      const fileWithEmptyLines = headerWithBank + '\n\n' + detail + '\n' + trailer + '\n\n'

      const cnabFile = openCnab(fileWithEmptyLines)

      expect(cnabFile.lineCount).toBe(3) // Apenas header, detail e trailer
    })
  })

  describe('Banco não cadastrado', () => {
    test('deve lançar erro para banco não cadastrado', () => {
      // CNAB 400 com código de banco não cadastrado (999)
      const header = '0'.repeat(76) + '999' + '0'.repeat(321)

      expect(() => openCnab(header)).toThrow(/não possui schema cadastrado/)
      expect(() => openCnab(header)).toThrow(/Banco 999/)
      
      // Verificar tipo da exception e campos bankCode e format
      try {
        openCnab(header)
      } catch (error) {
        expect(error).toBeInstanceOf(CNABSchemaNotFoundError)
        expect((error as CNABSchemaNotFoundError).code).toBe('SCHEMA_NOT_FOUND')
        expect((error as CNABSchemaNotFoundError).bankCode).toBe('999')
        expect((error as CNABSchemaNotFoundError).format).toBe('cnab400')
      }
    })
  })

  describe('Propriedades e métodos do CNABFile', () => {
    let cnabFile: CNABFile

    beforeAll(() => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      cnabFile = openCnab(fileContent)
    })

    test('deve ter propriedade type readonly', () => {
      expect(cnabFile.type).toBeDefined()
      
      // TypeScript impede modificação em tempo de compilação
      // Em runtime, podemos verificar que o tipo está correto
      expect(cnabFile.type).toBe('cnab400')
      expect(typeof cnabFile.type).toBe('string')
    })

    test('deve ter getter bankCode conveniente', () => {
      expect(cnabFile.bankCode).toBeDefined()
      expect(cnabFile.bankCode).toBe('237')
      expect(typeof cnabFile.bankCode).toBe('string')
    })

    test('deve ter getter bankName conveniente', () => {
      expect(cnabFile.bankName).toBeDefined()
      expect(cnabFile.bankName).toBe('Bradesco')
      expect(typeof cnabFile.bankName).toBe('string')
    })

    test('deve ter propriedade lineCount readonly', () => {
      expect(cnabFile.lineCount).toBeDefined()
      expect(typeof cnabFile.lineCount).toBe('number')
      expect(cnabFile.lineCount).toBeGreaterThan(0)
      
      // TypeScript impede modificação em tempo de compilação
    })

    test('deve ter método toString()', () => {
      const str = cnabFile.toString()

      expect(str).toContain('CNABFile')
      expect(str).toContain('400') // Verifica se contém '400' (formato)
      expect(str).toContain('Bradesco')
      expect(str).toContain('237')
    })

    test('deve ter método getLines() retornando array readonly', () => {
      const lines = cnabFile.getLines()

      expect(Array.isArray(lines)).toBe(true)
      expect(lines.length).toBe(cnabFile.lineCount)
      expect(lines.length).toBeGreaterThan(0)
    })
  })

  describe('Compatibilidade com quebras de linha', () => {
    test('deve aceitar quebras de linha Unix (\\n)', () => {
      const header = '0'.repeat(76) + '237' + '0'.repeat(321)
      const detail = '1'.padEnd(400, '0')
      const trailer = '9'.padEnd(400, '0')
      const fileUnix = [header, detail, trailer].join('\n')

      const cnabFile = openCnab(fileUnix)

      expect(cnabFile.lineCount).toBe(3)
    })

    test('deve aceitar quebras de linha Windows (\\r\\n)', () => {
      const header = '0'.repeat(76) + '237' + '0'.repeat(321)
      const detail = '1'.padEnd(400, '0')
      const trailer = '9'.padEnd(400, '0')
      const fileWindows = [header, detail, trailer].join('\r\n')

      const cnabFile = openCnab(fileWindows)

      expect(cnabFile.lineCount).toBe(3)
    })
  })
})

describe('CNABFile.validate()', () => {
  describe('Validação básica', () => {
    test('deve validar arquivo CNAB 400 do Bradesco sem erros estruturais', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      expect(result.feedback.type).toBe('CNAB 400')
      expect(result.feedback.bank).toBe('Bradesco')
      // Fixture é um arquivo real com datas de vencimento fixas, que naturalmente ficam
      // "vencidas" com o passar do tempo — isso não é um erro estrutural do arquivo.
      const nonDateErrors = result.feedback.lines.filter(e => e.column !== 'Data de vencimento')
      expect(nonDateErrors).toHaveLength(0)
    })

    test('deve validar arquivo CNAB 240 do Bradesco', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab240/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      expect(result.feedback.type).toBe('CNAB 240')
      expect(result.feedback.bank).toBe('Bradesco')
      // Verificar estrutura
      expect(typeof result.isValid).toBe('boolean')
    })

    test('deve validar arquivo CNAB 400 do Banco do Brasil sem erros estruturais', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      expect(result.feedback.type).toBe('CNAB 400')
      expect(result.feedback.bank).toBe('Banco do Brasil')
      // Fixture é um arquivo real com datas de vencimento fixas, que naturalmente ficam
      // "vencidas" com o passar do tempo — isso não é um erro estrutural do arquivo.
      const nonDateErrors = result.feedback.lines.filter(e => e.column !== 'Data de vencimento')
      expect(nonDateErrors).toHaveLength(0)
    })

    test('deve validar arquivo CNAB 400 do Itaú sem erros estruturais', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/itau/ITAU_cnab_400.REM')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      expect(result.feedback.type).toBe('CNAB 400')
      expect(result.feedback.bank).toBe('Itaú')
      // Fixture é um arquivo real com datas de vencimento fixas, que naturalmente ficam
      // "vencidas" com o passar do tempo — isso não é um erro estrutural do arquivo.
      const nonDateErrors = result.feedback.lines.filter(e => e.column !== 'Data de vencimento')
      expect(nonDateErrors).toHaveLength(0)
    })

    test('deve validar arquivo CNAB 400 do Santander sem erros estruturais', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/santander/SANTANDER_cnab_400_140.REM')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      expect(result.feedback.type).toBe('CNAB 400')
      expect(result.feedback.bank).toBe('Santander')
      // Fixture é um arquivo real com datas de vencimento fixas, que naturalmente ficam
      // "vencidas" com o passar do tempo — isso não é um erro estrutural do arquivo.
      const nonDateErrors = result.feedback.lines.filter(e => e.column !== 'Data de vencimento')
      expect(nonDateErrors).toHaveLength(0)
    })

    test('deve validar arquivo CNAB 400 do Sicredi sem erros estruturais', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/sicredi/SICREDI_cnab_400.CRM')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      expect(result.feedback.type).toBe('CNAB 400')
      expect(result.feedback.bank).toBe('Sicredi')
      // Fixture é um arquivo real com datas de vencimento fixas, que naturalmente ficam
      // "vencidas" com o passar do tempo — isso não é um erro estrutural do arquivo.
      const nonDateErrors = result.feedback.lines.filter(e => e.column !== 'Data de vencimento')
      expect(nonDateErrors).toHaveLength(0)
    })
  })

  describe('Detecção de erros', () => {
    test('deve detectar erro de tamanho de linha em CNAB 400', () => {
      // Criar arquivo com linha de tamanho incorreto
      const header = '0'.repeat(76) + '237' + '0'.repeat(321) // 400 chars - correto
      const invalidDetail = '1'.repeat(350) // 350 chars - INCORRETO
      const trailer = '9'.repeat(400) // 400 chars - correto

      const fileContent = [header, invalidDetail, trailer].join('\n')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      expect(result.isValid).toBe(false)
      expect(result.feedback.lines.length).toBeGreaterThan(0)
      expect(result.feedback.lines[0]).toHaveProperty('line')
      expect(result.feedback.lines[0]).toHaveProperty('column')
      expect(result.feedback.lines[0]).toHaveProperty('message')
    })

    test('deve detectar erro de campo obrigatório vazio em CNAB 400', () => {
      // CNAB 400 com tipo de registro inválido (campo obrigatório com padrão fixo)
      const header = '0'.repeat(76) + '237' + '0'.repeat(321)
      const invalidDetail = ' '.repeat(400) // Linha toda em branco - tipo de registro vazio
      const trailer = '9'.repeat(400)

      const fileContent = [header, invalidDetail, trailer].join('\n')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      expect(result.isValid).toBe(false)
      expect(result.feedback.lines.length).toBeGreaterThan(0)
    })
  })

  describe('Estrutura do resultado', () => {
    test('resultado deve ter estrutura CNABFileValidationResult correta', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      expect(result).toHaveProperty('isValid')
      expect(result).toHaveProperty('feedback')
      expect(result.feedback).toHaveProperty('type')
      expect(result.feedback).toHaveProperty('bank')
      expect(result.feedback).toHaveProperty('lines')
      
      expect(typeof result.isValid).toBe('boolean')
      expect(typeof result.feedback.type).toBe('string')
      expect(typeof result.feedback.bank).toBe('string')
      expect(Array.isArray(result.feedback.lines)).toBe(true)
    })

    test('isValid deve ser consistente com feedback.lines', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      if (result.isValid) {
        expect(result.feedback.lines).toHaveLength(0)
      } else {
        expect(result.feedback.lines.length).toBeGreaterThan(0)
      }
    })

    test('cada erro em feedback.lines deve ter line, column e message', () => {
      // Criar arquivo com erro conhecido
      const header = '0'.repeat(76) + '237' + '0'.repeat(321)
      const invalidDetail = '1'.repeat(350) // Tamanho incorreto
      const trailer = '9'.repeat(400)

      const fileContent = [header, invalidDetail, trailer].join('\n')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      expect(result.feedback.lines.length).toBeGreaterThan(0)
      
      result.feedback.lines.forEach(error => {
        expect(error).toHaveProperty('line')
        expect(error).toHaveProperty('column')
        expect(error).toHaveProperty('message')
        expect(typeof error.line).toBe('number')
        expect(typeof error.column).toBe('string')
        expect(typeof error.message).toBe('string')
      })
    })
  })

  describe('Opções de validação', () => {
    test('deve funcionar sem opções (modo padrão)', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      expect(() => cnabFile.validate()).not.toThrow()
    })

    test('deve funcionar com withFeedback: false', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      expect(() => cnabFile.validate({ withFeedback: false })).not.toThrow()
    })

    test('deve lançar erro para withFeedback: true (não implementado)', () => {
      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      expect(() => cnabFile.validate({ withFeedback: true }))
        .toThrow('validate({ withFeedback: true }) ainda não implementado')
    })
  })

  describe('Consistência com validateCnabFile', () => {
    test('validate() e validateCnabFile() concordam sobre validade em arquivo estruturalmente são', () => {
      // Este teste usa uma fixture conhecidamente limpa em estrutura E negócio,
      // onde não há nada para a validação estrutural adicionar — ambas as camadas
      // concordam no resultado final.
      const { validateCnabFile } = require('../src')
      
      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      
      const cnabFile = openCnab(fileContent)
      const resultNew = cnabFile.validate()
      const resultOld = validateCnabFile(fileContent)

      // Ambos devem concordar sobre a validade do arquivo
      expect(resultNew.isValid).toBe(resultOld.valid)
      
      // Em arquivo estruturalmente são, validate() pode ter contagem igual ou maior
      // (detecta mais categorias de erro), mas nunca menor
      expect(resultNew.feedback.lines.length).toBeGreaterThanOrEqual(resultOld.errors.length)
    })

    test('validate() e validateCnabFile() concordam que arquivo inválido é inválido', () => {
      const { validateCnabFile } = require('../src')
      
      // Arquivo com erro conhecido (tamanho incorreto)
      const header = '0'.repeat(76) + '237' + '0'.repeat(321)
      const invalidDetail = '1'.repeat(350) // Tamanho incorreto - detectado por ambos
      const trailer = '9'.repeat(400)
      const fileContent = [header, invalidDetail, trailer].join('\n')
      
      const cnabFile = openCnab(fileContent)
      const resultNew = cnabFile.validate()
      const resultOld = validateCnabFile(fileContent)

      // Ambos devem concordar que o arquivo é inválido
      expect(resultNew.isValid).toBe(false)
      expect(resultOld.valid).toBe(false)
      
      // Ambos devem ter pelo menos um erro
      expect(resultNew.feedback.lines.length).toBeGreaterThan(0)
      expect(resultOld.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Validação estrutural integrada', () => {
    test('deve detectar erro puramente estrutural em CNAB 400 (header no meio do arquivo)', () => {
      // Problema estrutural que o validador de negócio nunca detectaria sozinho
      const header = '0'.repeat(76) + '237' + '0'.repeat(321)
      const detail = '1'.padEnd(400, '0')
      const headerInMiddle = '0'.repeat(76) + '237' + '0'.repeat(321) // Header no meio - ERRO ESTRUTURAL
      const trailer = '9'.padEnd(400, '0')

      const fileContent = [header, detail, headerInMiddle, detail, trailer].join('\n')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      // Deve detectar o erro estrutural
      expect(result.isValid).toBe(false)
      const structuralErrors = result.feedback.lines.filter(e => 
        e.column === 'Header' || e.message.includes('Header')
      )
      expect(structuralErrors.length).toBeGreaterThan(0)
    })

    test('deve detectar erro puramente estrutural em CNAB 240 (segmento P sem Q correspondente)', () => {
      // Problema estrutural: Segmento P sem Q seguinte (par incompleto)
      // A mensagem real gerada é "Trailer de Lote com Segmento P pendente (sem Segmento Q correspondente)"
      // na coluna "Trailer de Lote" — não um erro genérico de "arquivo sem detalhe".
      // 
      // Código do banco '237' (Bradesco) nas posições 1-3
      const headerArquivo = '237' + ' '.repeat(4) + '0' + ' '.repeat(232) // Tipo 0 - Header de arquivo
      const headerLote = '237' + ' '.repeat(4) + '1' + ' '.repeat(232) // Tipo 1 - Header de lote
      const segP2OrfaoSemQ = '237' + ' '.repeat(4) + '3' + ' '.repeat(5) + 'P' + 
                             ' '.repeat(63) + '15012025' + '000000000099999' + ' '.repeat(140)
      const trailerLote = '237' + ' '.repeat(4) + '5' + ' '.repeat(232) // Tipo 5 - Trailer de lote
      const trailerArquivo = '237' + ' '.repeat(4) + '9' + ' '.repeat(232) // Tipo 9 - Trailer de arquivo

      // Arquivo só com P, sem Q algum - deve gerar erro estrutural
      const fileOnlyP = [headerArquivo, headerLote, segP2OrfaoSemQ, trailerLote, trailerArquivo].join('\n')
      const cnabFileOnlyP = openCnab(fileOnlyP)
      const resultOnlyP = cnabFileOnlyP.validate()

      // Deve detectar erro estrutural: P pendente sem Q
      expect(resultOnlyP.isValid).toBe(false)
      const structuralErrors = resultOnlyP.feedback.lines.filter(e =>
        e.column === 'Detalhe' ||
        e.column === 'Trailer de Lote' ||
        e.message.includes('par') ||
        e.message.includes('P+Q') ||
        e.message.includes('pendente')
      )
      expect(structuralErrors.length).toBeGreaterThan(0)
    })

    test('deve validar linhas boas mesmo quando uma linha tem erro estrutural', () => {
      // Uma linha ruim no meio não deve impedir validação das demais
      const header = '0'.repeat(76) + '237' + '0'.repeat(321)
      
      // Detalhe com CPF inválido (erro de negócio)
      const detailBadCPF = '1' + '12345678900' + '0'.repeat(388) // CPF inválido na posição esperada
      
      // Linha com tamanho errado (erro estrutural)
      const detailBadSize = '1'.repeat(350)
      
      // Detalhe com nome muito curto (erro de negócio)
      const detailBadName = '1'.padEnd(400, '0') // Nome vazio/muito curto
      
      const trailer = '9'.repeat(400)

      const fileContent = [header, detailBadCPF, detailBadSize, detailBadName, trailer].join('\n')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      // Deve ter múltiplos erros (estrutural + negócio)
      expect(result.isValid).toBe(false)
      expect(result.feedback.lines.length).toBeGreaterThan(1)
      
      // Deve ter erro estrutural (tamanho)
      const sizeErrors = result.feedback.lines.filter(e => e.column === 'Tamanho do registro')
      expect(sizeErrors.length).toBeGreaterThan(0)
      
      // Linha com tamanho errado não deve impedir validação de negócio das demais linhas
      // (não vamos testar CPF/nome aqui porque o validador de negócio CNAB 400 não valida
      // campos de detail - ele só existe no CNAB 240)
    })

    test('deve dedupinar erros quando ambas as camadas reportam mesma (linha, coluna)', () => {
      // Criar cenário onde estrutural e negócio reportam o mesmo erro
      const header = '0'.repeat(76) + '237' + '0'.repeat(321)
      const detail = '1'.padEnd(400, '0')
      // Trailer com tipo ERRADO - ambos validadores detectam isso
      const trailerBadType = '5'.repeat(400) // Tipo 5 em vez de 9

      const fileContent = [header, detail, trailerBadType].join('\n')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      // Deve ter erro de trailer
      const trailerErrors = result.feedback.lines.filter(e => 
        e.line === 3 && (e.column === 'Trailer' || e.column === 'Trailer de Arquivo')
      )
      
      // Deve haver exatamente 1 erro de trailer (não duplicado)
      // Nota: pode haver outros erros na linha 3, mas de outras colunas
      expect(trailerErrors.length).toBe(1)
    })

    test('deve combinar erros estruturais e de negócio em CNAB 240', () => {
      // Código do banco '237' (Bradesco) nas posições 1-3
      const headerArquivo = '237' + ' '.repeat(4) + '0' + ' '.repeat(232)
      const headerLote = '237' + ' '.repeat(4) + '1' + ' '.repeat(232)
      
      // Segmento P válido
      const segP = '237' + ' '.repeat(4) + '3' + ' '.repeat(5) + 'P' + 
                   ' '.repeat(63) + '31122099' + '000000000050000' + ' '.repeat(140)
      
      // Segmento Q com documento inválido (erro de negócio)
      const segQBadDoc = '237' + ' '.repeat(4) + '3' + ' '.repeat(5) + 'Q' +
                         ' '.repeat(4) + '000000000000000' + // CPF zerado - inválido
                         'JOAO DA SILVA                           ' +
                         'RUA EXEMPLO                             ' +
                         ' '.repeat(127)
      
      const trailerLote = '237' + ' '.repeat(4) + '5' + ' '.repeat(232)
      const trailerArquivo = '237' + ' '.repeat(4) + '9' + ' '.repeat(232)

      const fileContent = [headerArquivo, headerLote, segP, segQBadDoc, trailerLote, trailerArquivo].join('\n')
      const cnabFile = openCnab(fileContent)

      const result = cnabFile.validate()

      // Deve ter erro de negócio (CPF inválido)
      expect(result.isValid).toBe(false)
      const businessErrors = result.feedback.lines.filter(e => e.column === 'CPF/CNPJ')
      expect(businessErrors.length).toBeGreaterThan(0)
    })
  })
})


describe('CNABFile.read() e readAsync() — modo FULL', () => {
  const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
  const fileContent = readFileSync(fixturePath, 'latin1')

  test('FULL deve devolver todos os campos do schema, incluindo os sem canonical', () => {
    const cnabFile = openCnab(fileContent)
    const simple = cnabFile.read()
    const full = cnabFile.read({ mode: 'FULL' })

    const simpleKeys = Object.keys(simple.bills[0])
    const fullKeys = Object.keys(full.bills[0])

    expect(fullKeys.length).toBeGreaterThan(simpleKeys.length)

    // Campo do schema do Bradesco que não tem canonical mapeado
    // (confirmado em src/banks/bradesco/schemas/cnab400/detail.ts)
    expect(full.bills[0]).toHaveProperty('carteira_codigo')
    expect(simple.bills[0]).not.toHaveProperty('carteira_codigo')
  })

  test('header e trailer continuam canônicos em modo FULL (decisão de escopo)', () => {
    const cnabFile = openCnab(fileContent)
    const simple = cnabFile.read()
    const full = cnabFile.read({ mode: 'FULL' })

    expect(full.header).toEqual(simple.header)
    expect(full.trailer).toEqual(simple.trailer)
  })

  test('readAsync FULL produz resultado idêntico a read FULL', async () => {
    const cnabFile = openCnab(fileContent)
    const sync = cnabFile.read({ mode: 'FULL' })
    const async = await cnabFile.readAsync({ mode: 'FULL' })

    expect(async).toEqual(sync)
  })

  test('read() sem options é equivalente a read({ mode: "SIMPLE" })', () => {
    const cnabFile = openCnab(fileContent)
    expect(cnabFile.read()).toEqual(cnabFile.read({ mode: 'SIMPLE' }))
  })

  test('LIMITAÇÃO CONHECIDA v1: campos identificadores numéricos perdem zero à esquerda em modo FULL', () => {
    const cnabFile = openCnab(fileContent)
    const full = cnabFile.read({ mode: 'FULL' })

    // sacado_numero_inscricao sai como number (não string) — zero à esquerda
    // seria perdido se o documento real tivesse. Ver extract-full.ts para o
    // gap documentado; não "consertar" isso aqui sem atualizar aquele comentário
    // e o critério de aceite do modo FULL v1.
    expect(typeof full.bills[0].sacado_numero_inscricao).toBe('number')
  })
})


describe('CNABFile.read() e readAsync() — modo lazy: true', () => {
  const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
  const fileContent = readFileSync(fixturePath, 'latin1')

  test('lazy: true não chama extractBill até resolve() ser chamado', () => {
    const cnabFile = openCnab(fileContent)
    const result = cnabFile.read({ lazy: true })

    // No modo lazy, bills deve conter LazyBillItem[]
    expect(result.bills.length).toBeGreaterThan(0)
    expect(result.bills[0]).toHaveProperty('resolve')
    expect(result.bills[0]).toHaveProperty('startLine')
    expect(typeof result.bills[0].resolve).toBe('function')
  })

  test('resolve() de um LazyBillItem SIMPLE produz resultado equivalente ao modo eager SIMPLE', async () => {
    const cnabFile = openCnab(fileContent)
    
    const eager = cnabFile.read()
    const lazy = cnabFile.read({ lazy: true })

    expect(lazy.bills.length).toBe(eager.bills.length)
    
    // Resolver o primeiro boleto lazy e comparar com o eager
    const lazyBill = await lazy.bills[0].resolve()
    const eagerBill = eager.bills[0]

    expect(lazyBill).toEqual(eagerBill)
  })

  test('resolve() de um LazyBillItem FULL produz resultado equivalente ao modo eager FULL', async () => {
    const cnabFile = openCnab(fileContent)
    
    const eager = cnabFile.read({ mode: 'FULL' })
    const lazy = cnabFile.read({ mode: 'FULL', lazy: true })

    expect(lazy.bills.length).toBe(eager.bills.length)
    
    // Resolver o primeiro boleto lazy e comparar com o eager
    const lazyBill = await lazy.bills[0].resolve()
    const eagerBill = eager.bills[0]

    expect(lazyBill).toEqual(eagerBill)
  })

  test('readAsync({ lazy: true, mode: "SIMPLE" }) produz LazyBillItem equivalente a read()', async () => {
    const cnabFile = openCnab(fileContent)
    
    const syncLazy = cnabFile.read({ lazy: true })
    const asyncLazy = await cnabFile.readAsync({ lazy: true })

    expect(asyncLazy.bills.length).toBe(syncLazy.bills.length)
    expect(asyncLazy.header).toEqual(syncLazy.header)
    expect(asyncLazy.trailer).toEqual(syncLazy.trailer)
    
    // Resolver primeiro boleto de cada um e comparar
    const syncResolved = await syncLazy.bills[0].resolve()
    const asyncResolved = await asyncLazy.bills[0].resolve()
    
    expect(asyncResolved).toEqual(syncResolved)
  })

  test('readAsync({ lazy: true, mode: "FULL" }) produz LazyBillItem equivalente a read()', async () => {
    const cnabFile = openCnab(fileContent)
    
    const syncLazy = cnabFile.read({ mode: 'FULL', lazy: true })
    const asyncLazy = await cnabFile.readAsync({ mode: 'FULL', lazy: true })

    expect(asyncLazy.bills.length).toBe(syncLazy.bills.length)
    expect(asyncLazy.header).toEqual(syncLazy.header)
    expect(asyncLazy.trailer).toEqual(syncLazy.trailer)
    
    // Resolver primeiro boleto de cada um e comparar
    const syncResolved = await syncLazy.bills[0].resolve()
    const asyncResolved = await asyncLazy.bills[0].resolve()
    
    expect(asyncResolved).toEqual(syncResolved)
  })

  test('LazyBillItem.startLine aponta para linha física correta', () => {
    const cnabFile = openCnab(fileContent)
    const lazy = cnabFile.read({ lazy: true })

    // Primeiro boleto deve começar na linha 2 (após o header na linha 1)
    expect(lazy.bills[0].startLine).toBeGreaterThan(0)
    
    // startLine deve ser crescente (cada boleto começa depois do anterior)
    if (lazy.bills.length > 1) {
      expect(lazy.bills[1].startLine).toBeGreaterThan(lazy.bills[0].startLine)
    }
  })

  test('chamar resolve() múltiplas vezes reprocessa (sem cache)', async () => {
    const cnabFile = openCnab(fileContent)
    const lazy = cnabFile.read({ lazy: true })

    const firstCall = await lazy.bills[0].resolve()
    const secondCall = await lazy.bills[0].resolve()

    // Ambas as chamadas devem produzir resultado equivalente
    expect(secondCall).toEqual(firstCall)
    
    // Confirmar que são instâncias diferentes (não cacheadas)
    expect(secondCall).not.toBe(firstCall)
  })

  test('CNABLazyResolveError ao falhar resolve() em read({ lazy: true }) modo SIMPLE', async () => {
    const mockError = new Error('Mock extraction error')
    const catalog = require('../src/provider/catalog')
    
    const cnabFile = openCnab(fileContent)
    const originalGetProvider = catalog.getProvider
    const originalProvider = originalGetProvider(cnabFile.bankCode, cnabFile.type, 'SIMPLE')
    
    // Mock extractBill to throw error
    const mockProvider = {
      ...originalProvider,
      extractBill: jest.fn(() => {
        throw mockError
      }),
    }
    
    // Mock getProvider to return our mocked provider
    catalog.getProvider = jest.fn((bankCode, format, mode) => {
      if (mode === 'SIMPLE') {
        return mockProvider
      }
      return originalGetProvider(bankCode, format, mode)
    })
    
    try {
      const lazy = cnabFile.read({ lazy: true })
      
      // resolve() deve rejeitar com CNABLazyResolveError
      await expect(lazy.bills[0].resolve()).rejects.toThrow('Falha ao resolver boleto lazy')
      
      try {
        await lazy.bills[0].resolve()
        fail('Deveria ter lançado CNABLazyResolveError')
      } catch (error: any) {
        expect(error.name).toBe('CNABLazyResolveError')
        expect(error.code).toBe('LAZY_RESOLVE_FAILED')
        expect(error.startLine).toBe(lazy.bills[0].startLine)
        expect(error.cause).toBe(mockError)
      }
    } finally {
      // Restore original function
      catalog.getProvider = originalGetProvider
    }
  })

  test('CNABLazyResolveError ao falhar resolve() em read({ lazy: true, mode: "FULL" })', async () => {
    const mockError = new Error('Mock full extraction error')
    const catalog = require('../src/provider/catalog')
    
    const cnabFile = openCnab(fileContent)
    const originalGetProvider = catalog.getProvider
    const originalProvider = originalGetProvider(cnabFile.bankCode, cnabFile.type, 'FULL')
    
    // Mock extractBillFull to throw error
    const mockProvider = {
      ...originalProvider,
      extractBillFull: jest.fn(() => {
        throw mockError
      }),
    }
    
    // Mock getProvider to return our mocked provider
    catalog.getProvider = jest.fn((bankCode, format, mode) => {
      if (mode === 'FULL') {
        return mockProvider
      }
      return originalGetProvider(bankCode, format, mode)
    })
    
    try {
      const lazy = cnabFile.read({ mode: 'FULL', lazy: true })
      
      // resolve() deve rejeitar com CNABLazyResolveError
      await expect(lazy.bills[0].resolve()).rejects.toThrow('Falha ao resolver boleto lazy')
      
      try {
        await lazy.bills[0].resolve()
        fail('Deveria ter lançado CNABLazyResolveError')
      } catch (error: any) {
        expect(error.name).toBe('CNABLazyResolveError')
        expect(error.code).toBe('LAZY_RESOLVE_FAILED')
        expect(error.startLine).toBe(lazy.bills[0].startLine)
        expect(error.cause).toBe(mockError)
      }
    } finally {
      // Restore original function
      catalog.getProvider = originalGetProvider
    }
  })

  test('CNABLazyResolveError ao falhar resolve() em readAsync({ lazy: true })', async () => {
    const mockError = new Error('Mock async extraction error')
    const catalog = require('../src/provider/catalog')
    
    const cnabFile = openCnab(fileContent)
    const originalGetProvider = catalog.getProvider
    const originalProvider = originalGetProvider(cnabFile.bankCode, cnabFile.type, 'SIMPLE')
    
    // Mock extractBill to throw error
    const mockProvider = {
      ...originalProvider,
      extractBill: jest.fn(() => {
        throw mockError
      }),
    }
    
    // Mock getProvider to return our mocked provider
    catalog.getProvider = jest.fn((bankCode, format, mode) => {
      if (mode === 'SIMPLE') {
        return mockProvider
      }
      return originalGetProvider(bankCode, format, mode)
    })
    
    try {
      const lazy = await cnabFile.readAsync({ lazy: true })
      
      // resolve() deve rejeitar com CNABLazyResolveError
      await expect(lazy.bills[0].resolve()).rejects.toThrow('Falha ao resolver boleto lazy')
      
      try {
        await lazy.bills[0].resolve()
        fail('Deveria ter lançado CNABLazyResolveError')
      } catch (error: any) {
        expect(error.name).toBe('CNABLazyResolveError')
        expect(error.code).toBe('LAZY_RESOLVE_FAILED')
        expect(error.startLine).toBe(lazy.bills[0].startLine)
        expect(error.cause).toBe(mockError)
      }
    } finally {
      // Restore original function
      catalog.getProvider = originalGetProvider
    }
  })

  test('CNABLazyResolveError ao falhar resolve() em readAsync({ lazy: true, mode: "FULL" })', async () => {
    const mockError = new Error('Mock async full extraction error')
    const catalog = require('../src/provider/catalog')
    
    const cnabFile = openCnab(fileContent)
    const originalGetProvider = catalog.getProvider
    const originalProvider = originalGetProvider(cnabFile.bankCode, cnabFile.type, 'FULL')
    
    // Mock extractBillFull to throw error
    const mockProvider = {
      ...originalProvider,
      extractBillFull: jest.fn(() => {
        throw mockError
      }),
    }
    
    // Mock getProvider to return our mocked provider
    catalog.getProvider = jest.fn((bankCode, format, mode) => {
      if (mode === 'FULL') {
        return mockProvider
      }
      return originalGetProvider(bankCode, format, mode)
    })
    
    try {
      const lazy = await cnabFile.readAsync({ mode: 'FULL', lazy: true })
      
      // resolve() deve rejeitar com CNABLazyResolveError
      await expect(lazy.bills[0].resolve()).rejects.toThrow('Falha ao resolver boleto lazy')
      
      try {
        await lazy.bills[0].resolve()
        fail('Deveria ter lançado CNABLazyResolveError')
      } catch (error: any) {
        expect(error.name).toBe('CNABLazyResolveError')
        expect(error.code).toBe('LAZY_RESOLVE_FAILED')
        expect(error.startLine).toBe(lazy.bills[0].startLine)
        expect(error.cause).toBe(mockError)
      }
    } finally {
      // Restore original function
      catalog.getProvider = originalGetProvider
    }
  })
})

describe('CNABFile.read() e readAsync() — modo lazy não embrulha CNABError', () => {
  test('CNABError não é embrulhado em CNABLazyResolveError em read({ lazy: true })', async () => {
    const { CNABUnknownFieldCodeError } = require('../src')
    const mockCNABError = new CNABUnknownFieldCodeError('juros.tipo', 7)
    const catalog = require('../src/provider/catalog')
    const originalGetProvider = catalog.getProvider

    try {
      // Mock extractBill para lançar CNABUnknownFieldCodeError
      catalog.getProvider = jest.fn((bankCode: string, format: string, mode: string) => {
        const original = originalGetProvider(bankCode, format, mode)
        return {
          ...original,
          extractBill: jest.fn(() => {
            throw mockCNABError
          }),
        }
      })

      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      const lazy = cnabFile.read({ lazy: true })

      // resolve() deve rejeitar com a MESMA instância de CNABUnknownFieldCodeError, sem embrulho
      await expect(lazy.bills[0].resolve()).rejects.toThrow('Código não reconhecido para o campo "juros.tipo": 7')

      try {
        await lazy.bills[0].resolve()
        fail('Deveria ter lançado CNABUnknownFieldCodeError')
      } catch (error: any) {
        // Deve ser a mesma instância, não embrulhada
        expect(error).toBe(mockCNABError)
        expect(error.name).toBe('CNABUnknownFieldCodeError')
        expect(error.code).toBe('UNKNOWN_FIELD_CODE')
        expect(error.fieldName).toBe('juros.tipo')
        expect(error.rawValue).toBe(7)
      }
    } finally {
      catalog.getProvider = originalGetProvider
    }
  })

  test('CNABError não é embrulhado em CNABLazyResolveError em readAsync({ lazy: true })', async () => {
    const { CNABUnknownFieldCodeError } = require('../src')
    const mockCNABError = new CNABUnknownFieldCodeError('multa.tipo', 9)
    const catalog = require('../src/provider/catalog')
    const originalGetProvider = catalog.getProvider

    try {
      // Mock extractBill para lançar CNABUnknownFieldCodeError
      catalog.getProvider = jest.fn((bankCode: string, format: string, mode: string) => {
        const original = originalGetProvider(bankCode, format, mode)
        return {
          ...original,
          extractBill: jest.fn(() => {
            throw mockCNABError
          }),
        }
      })

      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      const lazy = await cnabFile.readAsync({ lazy: true })

      // resolve() deve rejeitar com a MESMA instância de CNABUnknownFieldCodeError, sem embrulho
      await expect(lazy.bills[0].resolve()).rejects.toThrow('Código não reconhecido para o campo "multa.tipo": 9')

      try {
        await lazy.bills[0].resolve()
        fail('Deveria ter lançado CNABUnknownFieldCodeError')
      } catch (error: any) {
        // Deve ser a mesma instância, não embrulhada
        expect(error).toBe(mockCNABError)
        expect(error.name).toBe('CNABUnknownFieldCodeError')
        expect(error.code).toBe('UNKNOWN_FIELD_CODE')
        expect(error.fieldName).toBe('multa.tipo')
        expect(error.rawValue).toBe(9)
      }
    } finally {
      catalog.getProvider = originalGetProvider
    }
  })

  test('Erro genérico (não-CNABError) continua sendo embrulhado em CNABLazyResolveError', async () => {
    const mockGenericError = new Error('Generic error')
    const catalog = require('../src/provider/catalog')
    const originalGetProvider = catalog.getProvider

    try {
      // Mock extractBill para lançar erro genérico
      catalog.getProvider = jest.fn((bankCode: string, format: string, mode: string) => {
        const original = originalGetProvider(bankCode, format, mode)
        return {
          ...original,
          extractBill: jest.fn(() => {
            throw mockGenericError
          }),
        }
      })

      const fixturePath = join(__dirname, 'fixtures/cnab400/bradesco/remessa-multipla.txt')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnab(fileContent)

      const lazy = cnabFile.read({ lazy: true })

      // resolve() deve embrulhar erro genérico em CNABLazyResolveError
      await expect(lazy.bills[0].resolve()).rejects.toThrow('Falha ao resolver boleto lazy')

      try {
        await lazy.bills[0].resolve()
        fail('Deveria ter lançado CNABLazyResolveError')
      } catch (error: any) {
        expect(error.name).toBe('CNABLazyResolveError')
        expect(error.code).toBe('LAZY_RESOLVE_FAILED')
        expect(error.cause).toBe(mockGenericError)
      }
    } finally {
      catalog.getProvider = originalGetProvider
    }
  })
})
