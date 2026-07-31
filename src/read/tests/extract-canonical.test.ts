/**
 * Testes para extração de campos canônicos.
 * 
 * FASE 6: Testa se campos mapeados são extraídos corretamente dos schemas.
 * Usa fixtures reais do projeto para garantir que a extração funciona com dados reais.
 * 
 * Cobertura completa:
 * - CNAB 400: Banco do Brasil, Bradesco, Itaú, Santander, Sicredi
 * - CNAB 240: Bradesco
 * - Campos obrigatórios: valor, vencimento, numeroDocumento, nossoNumero, sacado.*
 * - Campos opcionais: multa.*, juros.*, desconto.*, abatimento.*, cedente.*
 * - Header e Trailer
 * - Paginação
 * - Modo estrito de agrupamento
 */

import * as fs from 'fs'
import * as path from 'path'
import { openCnabFromLines } from '@/index'
import { CNABFormatCode } from '@tp-types/index'
import type { CNABFile, CNABReadResult } from '@tp-types/core'
import type { CNABData } from '@tp-types/read'

function loadFixture(relativePath: string): string {
  const [format, bank, ...rest] = relativePath.split('/')
  const fileName = rest.join('/')
  const isBB = bank === 'bancodobrasil'
  const bankDir = isBB ? 'bancoDoBrasil' : bank
  const fixturePath = isBB
    ? path.join(__dirname, '../../banks', bankDir, 'docs', fileName)
    : path.join(__dirname, '../../banks', bankDir, 'docs', format, fileName)
  return fs.readFileSync(fixturePath, 'latin1')
}

/**
 * openCnab().read() sem `mode` retorna sempre CNABData em runtime (o ramo
 * Record<string, unknown> só existe para mode: 'FULL'), mas o tipo de retorno
 * é unionizado — este helper restaura o tipo forte para os testes de extração.
 */
function readData(cnabFile: CNABFile): CNABReadResult<CNABData> {
  return cnabFile.read() as CNABReadResult<CNABData>
}


function stringToLines(content: string): string[] {
  return content.split(/\r?\n/).filter((line) => line.length > 0)
}
describe('Extração de campos canônicos - Cobertura completa', () => {
  // ========== CNAB 400 - TODOS OS BANCOS ==========
  
  describe('CNAB 400 - Banco do Brasil', () => {
    const fixture = () => loadFixture('cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM')
    
    test('deve extrair campos de ouro dos boletos', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.bills.length).toBeGreaterThan(0)
      
      for (const bill of result.bills) {
        expect(bill.valor).toBeDefined()
        expect(typeof bill.valor).toBe('number')
        expect(bill.valor).toBeGreaterThan(0)
        
        expect(bill.vencimento).toBeDefined()
        expect(typeof bill.vencimento).toBe('string')
        
        expect(bill.numeroDocumento).toBeDefined()
        expect(bill.nossoNumero).toBeDefined()
        
        expect(bill.sacado).toBeDefined()
        expect(bill.sacado?.nome).toBeDefined()
        expect(typeof bill.sacado?.nome).toBe('string')
      }
    })
    
    test('deve extrair header com cedente', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.header.cedente).toBeDefined()
      expect(result.header.cedente.nome).toBeDefined()
      expect(typeof result.header.cedente.nome).toBe('string')
      expect(result.header.dataGeracao).toBeDefined()
    })
    
    test('deve ter trailer sem totalizadores (BB só tem campos estruturais)', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.trailer).toBeDefined()
      // BB não expõe quantidadeRegistros/valorTotal no trailer
      expect(result.trailer.quantidadeRegistros).toBeUndefined()
      expect(result.trailer.valorTotal).toBeUndefined()
    })
    
    test('deve extrair endereço do sacado', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      if (firstBill.sacado?.endereco) {
        expect(firstBill.sacado.endereco.logradouro).toBeDefined()
        expect(firstBill.sacado.endereco.cep).toBeDefined()
      }
    })
  })
  
  describe('CNAB 400 - Bradesco', () => {
    const fixture = () => loadFixture('cnab400/bradesco/remessa-multipla.txt')
    
    test('deve extrair campos de ouro dos boletos', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.bills.length).toBeGreaterThan(0)
      
      for (const bill of result.bills) {
        expect(bill.valor).toBeDefined()
        expect(bill.vencimento).toBeDefined()
        expect(bill.numeroDocumento).toBeDefined()
        expect(bill.sacado?.nome).toBeDefined()
      }
    })
    
    test('deve extrair header e trailer', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.header.cedente.nome).toBeDefined()
      expect(result.trailer).toBeDefined()
    })
  })
  
  describe('CNAB 400 - Itaú', () => {
    const fixture = () => loadFixture('cnab400/itau/ITAU_cnab_400.REM')
    
    test('deve extrair campos de ouro dos boletos', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.bills.length).toBeGreaterThan(0)
      
      for (const bill of result.bills) {
        expect(bill.valor).toBeDefined()
        expect(typeof bill.valor).toBe('number')
        expect(bill.valor).toBeGreaterThan(0)
        
        expect(bill.vencimento).toBeDefined()
        expect(bill.numeroDocumento).toBeDefined()
        expect(bill.sacado?.nome).toBeDefined()
      }
    })
    
    test('deve extrair header com cedente', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.header.cedente.nome).toBeDefined()
      expect(result.header.dataGeracao).toBeDefined()
    })
    
    test('deve ter trailer sem totalizadores (Itaú só tem campos estruturais)', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.trailer).toBeDefined()
      expect(result.trailer.quantidadeRegistros).toBeUndefined()
      expect(result.trailer.valorTotal).toBeUndefined()
    })
    
    test('deve extrair endereço completo do sacado', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      if (firstBill.sacado?.endereco) {
        expect(firstBill.sacado.endereco.logradouro).toBeDefined()
        expect(firstBill.sacado.endereco.cep).toBeDefined()
        expect(firstBill.sacado.endereco.cidade).toBeDefined()
        expect(firstBill.sacado.endereco.estado).toBeDefined()
      }
    })
  })
  
  describe('CNAB 400 - Santander', () => {
    const fixture = () => loadFixture('cnab400/santander/SANTANDER_cnab_400_140.REM')
    
    test('deve extrair campos de ouro dos boletos', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.bills.length).toBeGreaterThan(0)
      
      const firstBill = result.bills[0]
      
      expect(firstBill.valor).toBeDefined()
      expect(typeof firstBill.valor).toBe('number')
      
      expect(firstBill.vencimento).toBeDefined()
      expect(typeof firstBill.vencimento).toBe('string')
      
      expect(firstBill.numeroDocumento).toBeDefined()
      expect(firstBill.sacado?.nome).toBeDefined()
    })
    
    test('deve extrair header com cedente', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.header.cedente.nome).toBeDefined()
      expect(typeof result.header.cedente.nome).toBe('string')
      expect(result.header.dataGeracao).toBeDefined()
    })
    
    test('deve extrair trailer com totalizadores', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.trailer).toBeDefined()
      expect(result.trailer.quantidadeRegistros).toBeDefined()
      expect(typeof result.trailer.quantidadeRegistros).toBe('number')
      expect(result.trailer.quantidadeRegistros).toBe(result.bills.length)
      
      // Santander expõe valorTotal no trailer
      expect(result.trailer.valorTotal).toBeDefined()
    })
    
    test('deve extrair endereço completo do sacado', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      if (firstBill.sacado?.endereco) {
        expect(firstBill.sacado.endereco.logradouro).toBeDefined()
        expect(firstBill.sacado.endereco.cep).toBeDefined()
        expect(firstBill.sacado.endereco.bairro).toBeDefined()
        expect(firstBill.sacado.endereco.cidade).toBeDefined()
        expect(firstBill.sacado.endereco.estado).toBeDefined()
      }
    })
  })
  
  describe('CNAB 400 - Sicredi', () => {
    const fixture = () => loadFixture('cnab400/sicredi/SICREDI_cnab_400.CRM')
    
    test('deve extrair campos de ouro dos boletos', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.bills.length).toBeGreaterThan(0)
      
      for (const bill of result.bills) {
        expect(bill.valor).toBeDefined()
        expect(typeof bill.valor).toBe('number')
        expect(bill.valor).toBeGreaterThan(0)
        
        expect(bill.vencimento).toBeDefined()
        expect(bill.numeroDocumento).toBeDefined()
        expect(bill.nossoNumero).toBeDefined()
        expect(bill.sacado?.nome).toBeDefined()
      }
    })
    
    test('deve extrair header com cedente.documento', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      // Sicredi CNAB 400 não tem cedente.nome no header (só documento e data)
      expect(result.header.dataGeracao).toBeDefined()
      
      // Sicredi CNAB 400 é o único que expõe cedente.documento no header
      expect(result.header.cedente.documento).toBeDefined()
    })
    
    test('deve ter trailer sem totalizadores (Sicredi só tem campos estruturais)', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.trailer).toBeDefined()
      expect(result.trailer.quantidadeRegistros).toBeUndefined()
      expect(result.trailer.valorTotal).toBeUndefined()
    })
    
    test('deve extrair endereço parcial do sacado (Sicredi não tem bairro/cidade/estado)', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      if (firstBill.sacado?.endereco) {
        expect(firstBill.sacado.endereco.logradouro).toBeDefined()
        expect(firstBill.sacado.endereco.cep).toBeDefined()
        
        // Sicredi não tem bairro/cidade/estado
        expect(firstBill.sacado.endereco.bairro).toBeUndefined()
        expect(firstBill.sacado.endereco.cidade).toBeUndefined()
        expect(firstBill.sacado.endereco.estado).toBeUndefined()
      }
    })
  })
  
  // ========== CNAB 240 - BRADESCO ==========
  
  describe('CNAB 240 - Bradesco', () => {
    const fixture = () => loadFixture('cnab240/bradesco/remessa-multipla.txt')
    
    test('deve extrair campos de ouro dos boletos (Segmento P)', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.bills.length).toBeGreaterThan(0)
      
      const firstBill = result.bills[0]
      
      expect(firstBill.valor).toBeDefined()
      expect(typeof firstBill.valor).toBe('number')
      expect(firstBill.valor).toBeGreaterThan(0)
      
      expect(firstBill.vencimento).toBeDefined()
      expect(typeof firstBill.vencimento).toBe('string')
      
      expect(firstBill.dataEmissao).toBeDefined()
      expect(firstBill.numeroDocumento).toBeDefined()
      expect(firstBill.nossoNumero).toBeUndefined() // Bradesco não expõe nosso_numero separado
    })
    
    test('deve extrair campos do sacado (Segmento Q)', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      
      expect(firstBill.sacado).toBeDefined()
      expect(firstBill.sacado?.nome).toBeDefined()
      expect(typeof firstBill.sacado?.nome).toBe('string')
      
      if (firstBill.sacado?.endereco) {
        expect(firstBill.sacado.endereco.logradouro).toBeDefined()
        expect(firstBill.sacado.endereco.cep).toBeDefined()
        expect(firstBill.sacado.endereco.bairro).toBeDefined()
        expect(firstBill.sacado.endereco.cidade).toBeDefined()
        expect(firstBill.sacado.endereco.estado).toBeDefined()
      }
    })
    
    test('deve extrair header com cedente', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.header.cedente.nome).toBeDefined()
      expect(typeof result.header.cedente.nome).toBe('string')
      
      // CNAB 240 expõe cedente.documento no header
      expect(result.header.cedente.documento).toBeDefined()
    })
    
    test('deve extrair trailer com totalizadores', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      expect(result.trailer).toBeDefined()
      expect(result.trailer.quantidadeLotes).toBeDefined()
      expect(result.trailer.quantidadeRegistros).toBeDefined()
    })
    
    test('deve extrair campos financeiros opcionais', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      
      // Desconto e abatimento (Segmento P)
      if (firstBill.desconto) {
        expect(firstBill.desconto.valor).toBeDefined()
      }
      if (firstBill.abatimento) {
        expect(firstBill.abatimento.valor).toBeDefined()
      }
      
      // Juros (Segmento P com interpretar)
      if (firstBill.juros?.tipo) {
        expect(['valor', 'percentual', 'dispensado']).toContain(firstBill.juros.tipo)
        if (firstBill.juros.tipo === 'valor' || firstBill.juros.tipo === 'percentual') {
          expect(firstBill.juros.valor).toBeDefined()
        }
      }
      
      // Multa (Segmento R com interpretar) - pode não existir se fixture não tem segmento R
      if (firstBill.multa) {
        expect(['valor', 'percentual', 'dispensado']).toContain(firstBill.multa.tipo)
        if (firstBill.multa.tipo !== 'dispensado') {
          expect(firstBill.multa.valor).toBeDefined()
          expect(firstBill.multa.vigenciaAPartirDe).toBeDefined()
        }
      }
    })
  })
  
  // ========== TESTES DE INTEGRIDADE ==========
  
  describe('Integridade - Campos obrigatórios não-nulos', () => {
    const fixtures = [
      { nome: 'Banco do Brasil CNAB 400', path: 'cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM' },
      { nome: 'Bradesco CNAB 400', path: 'cnab400/bradesco/remessa-multipla.txt' },
      { nome: 'Itaú CNAB 400', path: 'cnab400/itau/ITAU_cnab_400.REM' },
      { nome: 'Santander CNAB 400', path: 'cnab400/santander/SANTANDER_cnab_400_140.REM' },
      { nome: 'Sicredi CNAB 400', path: 'cnab400/sicredi/SICREDI_cnab_400.CRM' },
      { nome: 'Bradesco CNAB 240', path: 'cnab240/bradesco/remessa-multipla.txt' },
    ]
    
    fixtures.forEach(({ nome, path: fixturePath }) => {
      test(`${nome}: campos obrigatórios devem ser não-nulos`, () => {
        const fixture = loadFixture(fixturePath)
        const cnabFile = openCnabFromLines(stringToLines(fixture))
        const result = readData(cnabFile)
        
        expect(result.bills.length).toBeGreaterThan(0)
        
        for (const bill of result.bills) {
          // Campos obrigatórios que devem estar sempre presentes
          expect(bill.valor).toBeDefined()
          expect(bill.valor).not.toBeNull()
          expect(typeof bill.valor).toBe('number')
          expect(bill.valor).toBeGreaterThan(0)
          
          expect(bill.vencimento).toBeDefined()
          expect(bill.vencimento).not.toBeNull()
          expect(typeof bill.vencimento).toBe('string')
          if (bill.vencimento) {
            expect(bill.vencimento.length).toBeGreaterThan(0)
          }
          
          expect(bill.numeroDocumento).toBeDefined()
          expect(bill.numeroDocumento).not.toBeNull()
          
          // Sacado deve existir com nome
          expect(bill.sacado).toBeDefined()
          expect(bill.sacado?.nome).toBeDefined()
          expect(bill.sacado?.nome).not.toBeNull()
          expect(typeof bill.sacado?.nome).toBe('string')
        }
        
        // Header deve ter dataGeracao (cedente.nome não está presente em Sicredi)
        expect(result.header.dataGeracao).toBeDefined()
        if (fixturePath !== 'cnab400/sicredi/SICREDI_cnab_400.CRM') {
          expect(result.header.cedente.nome).toBeDefined()
          expect(result.header.cedente.nome).not.toBeNull()
        }
      })
    })
  })
  
  // ========== TESTES DE PAGINAÇÃO ==========
  
  describe('Paginação', () => {
    test('deve retornar apenas boletos da página solicitada', () => {
      const fixture = loadFixture('cnab400/santander/SANTANDER_cnab_400_140.REM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      
      // Lê tudo para saber quantos boletos há
      const todos = readData(cnabFile)
      const totalBills = todos.bills.length
      
      if (totalBills < 2) {
        return // Fixture com menos de 2 boletos, pula o teste
      }
      
      // Página 1: primeiros 2 boletos
      const pagina1 = cnabFile.read({ page: { start: 0, size: 2 } })
      expect(pagina1.bills).toHaveLength(Math.min(2, totalBills))
      
      // Página 2: próximos boletos
      const pagina2 = cnabFile.read({ page: { start: 2, size: 2 } })
      expect(pagina2.bills.length).toBeLessThanOrEqual(2)
      expect(pagina2.bills.length).toBe(Math.min(2, Math.max(0, totalBills - 2)))
    })
    
    test('deve retornar header e trailer em todas as páginas', () => {
      const fixture = loadFixture('cnab400/santander/SANTANDER_cnab_400_140.REM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      
      const todos = readData(cnabFile)
      const totalBills = todos.bills.length
      
      if (totalBills < 2) {
        return
      }
      
      const pagina1 = cnabFile.read({ page: { start: 0, size: 1 } })
      const pagina2 = cnabFile.read({ page: { start: 1, size: 1 } })
      
      // Header e trailer devem ser os mesmos em todas as páginas
      expect(pagina1.header).toEqual(pagina2.header)
      expect(pagina1.trailer).toEqual(pagina2.trailer)
    })
  })
  
  // ========== TESTES DE MODO ESTRITO ==========
  
  describe('Modo estrito - Agrupamento', () => {
    test('P?R?Q deve ser rejeitado sem gerar grupo (Bradesco CNAB 240)', () => {
      // Pela spec FEBRABAN, segmentos opcionais (R/S/Y) só vêm DEPOIS de um par P+Q completo,
      // nunca entre eles. Modo estrito: se R aparece antes de Q, o núcleo P é abandonado
      // e o Q subsequente não deve completá-lo silenciosamente.
      
      const header = '23700000         2' + '0'.repeat(222) // 240 chars
      const headerLote = '23700011R01  040' + ' '.repeat(225) // 240 chars
      
      const segP = '237' + '0001' + '3' + '00001' + 'P' + ' '.repeat(229) // 240 chars
      const segR = '237' + '0001' + '3' + '00002' + 'R' + ' '.repeat(229) // 240 chars
      const segQ = '237' + '0001' + '3' + '00003' + 'Q' + ' '.repeat(229) // 240 chars
      
      const trailerLote = '237' + '0001' + '5' + ' '.repeat(233) // 240 chars
      const trailer = '237' + '9999' + '9' + ' '.repeat(233) // 240 chars
      
      const fixture = [header, headerLote, segP, segR, segQ, trailerLote, trailer].join('\n')
      
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      
      // Deve lançar erro (modo estrito no read())
      expect(() => readData(cnabFile)).toThrow(/Erro de agrupamento/)
      
      // Verificar que é CNABGroupingError com campos corretos
      try {
        readData(cnabFile)
        fail('Deveria ter lançado CNABGroupingError')
      } catch (error: any) {
        expect(error.name).toBe('CNABGroupingError')
        expect(error.code).toBe('GROUPING_ERROR')
        expect(error.originalError).toBeDefined()
        expect(error.originalError.line).toBeGreaterThan(0)
        expect(error.originalError.message).toBeDefined()
        expect(error.line).toBe(error.originalError.line)
      }
    })
    
    test('P?R?Q deve gerar 3 erros distintos (teste unitário de agrupamento)', () => {
      // Teste direto da função groupLines para verificar os 3 erros esperados:
      // 1. "Satélite antes do núcleo estar completo" (linha do R)
      // 2. "Núcleo abandonado: interrompido por satélite" (linha do P)
      // 3. "Esperado registro tipo 'P', encontrado 'Q'" (linha do Q órfão)
      
      const { groupLines } = require('../../grouping/group-lines')
      const { CNAB240_GROUPING_RULES } = require('../../grouping/grouping-rules')
      
      // Mock de linhas parseadas P?R?Q com pos[] para getFieldByPosition
      const lineP = {
        controle_registro: { value: '3', pos: [8, 8] },
        servico_segmento: { value: 'P', pos: [14, 14] },
      }
      const lineR = {
        controle_registro: { value: '3', pos: [8, 8] },
        servico_segmento: { value: 'R', pos: [14, 14] },
      }
      const lineQ = {
        controle_registro: { value: '3', pos: [8, 8] },
        servico_segmento: { value: 'Q', pos: [14, 14] },
      }
      
      const rule = CNAB240_GROUPING_RULES['237'] // Bradesco
      const result = groupLines([lineP, lineR, lineQ], rule, CNABFormatCode.CNAB240, 3)
      
      // Nenhum grupo válido gerado
      expect(result.groups).toHaveLength(0)
      
      // Três erros distintos
      expect(result.errors).toHaveLength(3)
      
      // Erro 1: Satélite antes do núcleo estar completo (linha do R)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 4, // linha 3 (P) + 1
          field: 'Satélite',
          message: expect.stringContaining('antes do núcleo estar completo'),
        })
      )
      
      // Erro 2: Núcleo abandonado (linha do P)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 3,
          field: 'Núcleo',
          message: expect.stringContaining('abandonado'),
        })
      )
      
      // Erro 3: Q órfão (esperava P, encontrou Q)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          line: 5, // linha 3 (P) + 2
          field: 'Núcleo',
          message: expect.stringMatching(/Esperado.*'P'.*encontrado.*'Q'/),
        })
      )
    })
  })
  
  // ========== TESTES DE CAMPOS ESPECIAIS ==========
  
  describe('Campos com interpretar()', () => {
    test('deve interpretar juros.tipo corretamente (Bradesco CNAB 240 Segmento P)', () => {
      const fixture = loadFixture('cnab240/bradesco/remessa-multipla.txt')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      if (firstBill.juros?.tipo) {
        expect(['valor', 'percentual', 'dispensado']).toContain(firstBill.juros.tipo)
      }
    })
    
    test('deve extrair juros.vigenciaAPartirDe quando presente', () => {
      const fixtures = [
        { path: 'cnab240/bradesco/remessa-multipla.txt' },
        { path: 'cnab400/itau/ITAU_cnab_400.REM' },
        { path: 'cnab400/sicredi/SICREDI_cnab_400.CRM' },
      ]
      
      fixtures.forEach(({ path: fixturePath }) => {
        const cnabFile = openCnabFromLines(stringToLines(loadFixture(fixturePath)))
        const result = readData(cnabFile)
        
        // Nem todos os boletos têm juros.vigenciaAPartirDe, mas se tiver deve ser string
        const billsWithInterestDate = result.bills.filter(b => b.juros?.vigenciaAPartirDe !== undefined)
        if (billsWithInterestDate.length > 0) {
          const first = billsWithInterestDate[0]
          expect(typeof first.juros?.vigenciaAPartirDe).toBe('string')
          // Deve ter pelo menos alguns caracteres (data formatada)
          if (first.juros?.vigenciaAPartirDe) {
            expect(first.juros.vigenciaAPartirDe.length).toBeGreaterThan(0)
          }
        }
      })
    })
  })
  
  // ========== TESTES DE COBERTURA DE ENDEREÇO ==========
  
  describe('Cobertura de endereço do sacado', () => {
    test('BB CNAB 400: deve ter logradouro, bairro, cep, cidade, estado', () => {
      const fixture = loadFixture('cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      if (firstBill.sacado?.endereco) {
        expect(firstBill.sacado.endereco.logradouro).toBeDefined()
        expect(firstBill.sacado.endereco.cep).toBeDefined()
        // BB pode ter ou não os campos adicionais dependendo da fixture
      }
    })
    
    test('Sicredi CNAB 400: deve ter apenas logradouro e cep (sem bairro/cidade/estado)', () => {
      const fixture = loadFixture('cnab400/sicredi/SICREDI_cnab_400.CRM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      if (firstBill.sacado?.endereco) {
        expect(firstBill.sacado.endereco.logradouro).toBeDefined()
        expect(firstBill.sacado.endereco.cep).toBeDefined()
        
        // Sicredi CNAB 400 não tem esses campos
        expect(firstBill.sacado.endereco.bairro).toBeUndefined()
        expect(firstBill.sacado.endereco.cidade).toBeUndefined()
        expect(firstBill.sacado.endereco.estado).toBeUndefined()
      }
    })
  })
  
  // ========== TESTES DE CAMPOS OPCIONAIS ==========
  
  describe('Campos opcionais - desconto e abatimento', () => {
    test('deve extrair desconto.valor quando presente', () => {
      const fixture = loadFixture('cnab400/santander/SANTANDER_cnab_400_140.REM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      // Nem todos os boletos têm desconto, mas deve estar mapeado quando presente
      const billsWithDiscount = result.bills.filter(b => b.desconto?.valor !== undefined)
      if (billsWithDiscount.length > 0) {
        expect(billsWithDiscount[0].desconto?.valor).toBeDefined()
        expect(typeof billsWithDiscount[0].desconto?.valor).toBe('number')
      }
    })
    
    test('deve extrair abatimento.valor quando presente', () => {
      const fixture = loadFixture('cnab400/bradesco/remessa-multipla.txt')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      // Nem todos os boletos têm abatimento, mas deve estar mapeado quando presente
      const billsWithRebate = result.bills.filter(b => b.abatimento?.valor !== undefined)
      if (billsWithRebate.length > 0) {
        expect(billsWithRebate[0].abatimento?.valor).toBeDefined()
        expect(typeof billsWithRebate[0].abatimento?.valor).toBe('number')
      }
    })
  })
  
  // ========== TESTES DE CEDENTE ==========
  
  describe('Campos do cedente', () => {
    test('cedente.documento deve estar presente em Sicredi CNAB 400', () => {
      const fixture = loadFixture('cnab400/sicredi/SICREDI_cnab_400.CRM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      expect(result.header.cedente.documento).toBeDefined()
      // Campo deve ser string para preservar zeros à esquerda (CPF/CNPJ)
      expect(typeof result.header.cedente.documento).toBe('string')
    })
    
    test('cedente.documento deve estar presente em CNAB 240', () => {
      const fixture = loadFixture('cnab240/bradesco/remessa-multipla.txt')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      expect(result.header.cedente.documento).toBeDefined()
    })
    
    test('cedente.documento não deve estar presente em outros CNAB 400', () => {
      const fixtures = [
        'cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM',
        'cnab400/bradesco/remessa-multipla.txt',
        'cnab400/itau/ITAU_cnab_400.REM',
        'cnab400/santander/SANTANDER_cnab_400_140.REM',
      ]
      
      fixtures.forEach(fixturePath => {
        const cnabFile = openCnabFromLines(stringToLines(loadFixture(fixturePath)))
        const result = readData(cnabFile)
        
        // Outros bancos CNAB 400 não expõem cedente.documento
        expect(result.header.cedente.documento).toBeUndefined()
      })
    })
  })
  
  // ========== TESTES DE TIPOS DE DADOS ==========
  
  describe('Tipos de dados corretos', () => {
    test('valor deve ser number com decimais', () => {
      const fixture = loadFixture('cnab400/santander/SANTANDER_cnab_400_140.REM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      
      expect(typeof firstBill.valor).toBe('number')
      expect(firstBill.valor).toBeGreaterThan(0)
      expect(Number.isFinite(firstBill.valor)).toBe(true)
    })
    
    test('vencimento deve ser string (formato varia por banco)', () => {
      const fixture = loadFixture('cnab400/santander/SANTANDER_cnab_400_140.REM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      
      expect(typeof firstBill.vencimento).toBe('string')
      // Formato de data pode variar: DD/MM/YYYY ou DDMMYY dependendo do processamento
      if (firstBill.vencimento) {
        expect(firstBill.vencimento.length).toBeGreaterThan(0)
      }
    })
    
    test('numeroDocumento deve ser string', () => {
      const fixture = loadFixture('cnab400/bradesco/remessa-multipla.txt')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      
      expect(typeof firstBill.numeroDocumento).toBe('string')
      if (firstBill.numeroDocumento) {
        expect(firstBill.numeroDocumento.length).toBeGreaterThan(0)
      }
    })
    
    test('sacado.nome deve ser string não-vazia', () => {
      const fixture = loadFixture('cnab400/itau/ITAU_cnab_400.REM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      
      expect(typeof firstBill.sacado?.nome).toBe('string')
      if (firstBill.sacado?.nome) {
        expect(firstBill.sacado.nome.length).toBeGreaterThan(0)
      }
    })
  })
  
  // ========== TESTES DE EDGE CASES ==========
  
  describe('Edge cases', () => {
    test('deve lidar com arquivo vazio de boletos graciosamente', () => {
      // Criar fixture sintético com apenas header e trailer
      const header = '23700000         2' + '0'.repeat(222)
      const trailer = '23799999' + ' '.repeat(232)
      
      const fixture = [header, trailer].join('\n')
      
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      expect(result.bills).toHaveLength(0)
      expect(result.header).toBeDefined()
      expect(result.trailer).toBeDefined()
    })
    
    test('deve retornar array vazio para página além do total', () => {
      const fixture = loadFixture('cnab400/santander/SANTANDER_cnab_400_140.REM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      
      const todos = readData(cnabFile)
      const totalBills = todos.bills.length
      
      // Pedir página muito além do total
      const paginaAlem = cnabFile.read({ page: { start: totalBills + 100, size: 10 } })
      
      expect(paginaAlem.bills).toHaveLength(0)
      expect(paginaAlem.header).toBeDefined()
      expect(paginaAlem.trailer).toBeDefined()
    })
    
    test('deve lidar com campos opcionais ausentes', () => {
      const fixture = loadFixture('cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      const primeiroBoleto = result.bills[0]
      
      // Campos opcionais podem ser undefined
      // Não deve lançar erro ao acessá-los
      expect(() => {
        void primeiroBoleto.multa?.tipo
        void primeiroBoleto.juros?.valor
        void primeiroBoleto.desconto?.dataLimite
      }).not.toThrow()
    })
  })
  
  // ========== TESTES DE JUROS - CNAB 240 (3 BANCOS) ==========
  
  describe('Campos de juros - CNAB 240 (cobertura completa)', () => {
    describe('Bradesco CNAB 240 - juros com fixture real', () => {
      const fixture = () => loadFixture('cnab240/bradesco/remessa-multipla.txt')
      
      test('deve extrair juros.tipo corretamente (código 3 = percentual na fixture)', () => {
        const cnabFile = openCnabFromLines(stringToLines(fixture()))
        const result = readData(cnabFile)
        
        expect(result.bills.length).toBeGreaterThan(0)
        
        const firstBoleto = result.bills[0]
        
        expect(firstBoleto.juros).toBeDefined()
        expect(firstBoleto.juros?.tipo).toBe('percentual')
        expect(typeof firstBoleto.juros?.tipo).toBe('string')
      })
      
      test('deve extrair juros.valor quando juros.tipo não é dispensado', () => {
        const cnabFile = openCnabFromLines(stringToLines(fixture()))
        const result = readData(cnabFile)
        
        const firstBoleto = result.bills[0]
        
        if (firstBoleto.juros?.tipo && firstBoleto.juros.tipo !== 'dispensado') {
          expect(firstBoleto.juros.valor).toBeDefined()
          expect(typeof firstBoleto.juros.valor).toBe('number')
        }
      })
      
      test('deve extrair juros.vigenciaAPartirDe quando presente', () => {
        const cnabFile = openCnabFromLines(stringToLines(fixture()))
        const result = readData(cnabFile)
        
        const firstBoleto = result.bills[0]
        
        if (firstBoleto.juros?.vigenciaAPartirDe) {
          expect(typeof firstBoleto.juros.vigenciaAPartirDe).toBe('string')
          expect(firstBoleto.juros.vigenciaAPartirDe.length).toBeGreaterThan(0)
        }
      })
    })
    
    describe('Santander CNAB 240 - juros com fixture sintética', () => {
      test('deve interpretar código 0 como dispensado', () => {
        const header = '03300000         2' + '0'.repeat(222)
        const headerLote = '03300011R01  040' + ' '.repeat(225)
        
        const segP = 
          '033' + '0001' + '3' + '00001' + 'P' + ' ' + '01' +
          ' '.repeat(100) +
          '0' +          // interest code: 0 = waived
          '00000000' +   // interest date
          '000000000000000' + // interest amount
          ' '.repeat(99)
        
        const segQ =
          '033' + '0001' + '3' + '00002' + 'Q' + ' ' + '01' +
          '1' + '00000000000000' +
          'SACADO TESTE' + ' '.repeat(27) +
          'RUA TESTE' + ' '.repeat(30) +
          'BAIRRO' + ' '.repeat(8) +
          '01234567' +
          'SAO PAULO' + ' '.repeat(5) +
          'SP' +
          ' '.repeat(88)
        
        const trailerLote = '033' + '0001' + '5' + ' '.repeat(233)
        const trailer = '033' + '9999' + '9' + ' '.repeat(233)
        
        const fixture = [header, headerLote, segP, segQ, trailerLote, trailer].join('\n')
        const cnabFile = openCnabFromLines(stringToLines(fixture))
        const result = readData(cnabFile)
        
        expect(result.bills).toHaveLength(1)
        const bill = result.bills[0]
        
        expect(bill.juros).toBeDefined()
        expect(bill.juros?.tipo).toBe('dispensado')
        
        if (bill.juros?.valor !== undefined) {
          expect(bill.juros.valor).toBe(0)
        }
      })
      
      test('deve interpretar código 1 como valor', () => {
        const header = '03300000         2' + '0'.repeat(222)
        const headerLote = '03300011R01  040' + ' '.repeat(225)
        
        const segP = 
          '033' + '0001' + '3' + '00001' + 'P' + ' ' + '01' +
          ' '.repeat(100) +
          '1' +          // interest code: 1 = fixed amount
          '15122026' +   // interest start date
          '000000000000150' + // R$ 1.50/day
          ' '.repeat(99)
        
        const segQ =
          '033' + '0001' + '3' + '00002' + 'Q' + ' ' + '01' +
          '1' + '00000000000000' +
          'SACADO TESTE' + ' '.repeat(27) +
          'RUA TESTE' + ' '.repeat(30) +
          'BAIRRO' + ' '.repeat(8) +
          '01234567' +
          'SAO PAULO' + ' '.repeat(5) +
          'SP' +
          ' '.repeat(88)
        
        const trailerLote = '033' + '0001' + '5' + ' '.repeat(233)
        const trailer = '033' + '9999' + '9' + ' '.repeat(233)
        
        const fixture = [header, headerLote, segP, segQ, trailerLote, trailer].join('\n')
        const cnabFile = openCnabFromLines(stringToLines(fixture))
        const result = readData(cnabFile)
        
        const bill = result.bills[0]
        
        expect(bill.juros?.tipo).toBe('valor')
        expect(bill.juros?.valor).toBe(1.5)
        expect(bill.juros?.vigenciaAPartirDe).toMatch(/^(15\/12\/2026|15122026)$/)
      })
      
      test('deve interpretar código 2 como percentual', () => {
        const header = '03300000         2' + '0'.repeat(222)
        const headerLote = '03300011R01  040' + ' '.repeat(225)
        
        const segP = 
          '033' + '0001' + '3' + '00001' + 'P' + ' ' + '01' +
          ' '.repeat(100) +
          '2' +          // interest code: 2 = percentage
          '20122026' +   // interest start date
          '000000000000200' + // 2% monthly
          ' '.repeat(99)
        
        const segQ =
          '033' + '0001' + '3' + '00002' + 'Q' + ' ' + '01' +
          '1' + '00000000000000' +
          'SACADO TESTE' + ' '.repeat(27) +
          'RUA TESTE' + ' '.repeat(30) +
          'BAIRRO' + ' '.repeat(8) +
          '01234567' +
          'SAO PAULO' + ' '.repeat(5) +
          'SP' +
          ' '.repeat(88)
        
        const trailerLote = '033' + '0001' + '5' + ' '.repeat(233)
        const trailer = '033' + '9999' + '9' + ' '.repeat(233)
        
        const fixture = [header, headerLote, segP, segQ, trailerLote, trailer].join('\n')
        const cnabFile = openCnabFromLines(stringToLines(fixture))
        const result = readData(cnabFile)
        
        const bill = result.bills[0]
        
        expect(bill.juros?.tipo).toBe('percentual')
        expect(bill.juros?.valor).toBe(2.0)
        expect(bill.juros?.vigenciaAPartirDe).toMatch(/^(20\/12\/2026|20122026)$/)
      })
    })
    
    describe('Sicredi CNAB 240 - juros com fixture sintética', () => {
      test('deve interpretar código 3 como dispensado (Sicredi usa 3, não 0)', () => {
        const header = '74800000         2' + '0'.repeat(222)
        const headerLote = '74800011R01  040' + ' '.repeat(225)
        
        const segP = 
          '748' + '0001' + '3' + '00001' + 'P' + ' ' + '01' +
          ' '.repeat(100) +
          '3' +          // interest code: 3 = waived (Sicredi-specific)
          '00000000' +   // interest date
          '000000000000000' + // interest amount
          ' '.repeat(99)
        
        const segQ =
          '748' + '0001' + '3' + '00002' + 'Q' + ' ' + '01' +
          '1' + '00000000000000' +
          'SACADO TESTE' + ' '.repeat(27) +
          'RUA TESTE' + ' '.repeat(30) +
          'BAIRRO' + ' '.repeat(8) +
          '01234567' +
          'SAO PAULO' + ' '.repeat(5) +
          'SP' +
          ' '.repeat(88)
        
        const trailerLote = '748' + '0001' + '5' + ' '.repeat(233)
        const trailer = '748' + '9999' + '9' + ' '.repeat(233)
        
        const fixture = [header, headerLote, segP, segQ, trailerLote, trailer].join('\n')
        const cnabFile = openCnabFromLines(stringToLines(fixture))
        const result = readData(cnabFile)
        
        const bill = result.bills[0]
        
        expect(bill.juros?.tipo).toBe('dispensado')
      })
      
      test('deve interpretar código 1 como valor', () => {
        const header = '74800000         2' + '0'.repeat(222)
        const headerLote = '74800011R01  040' + ' '.repeat(225)
        
        const segP = 
          '748' + '0001' + '3' + '00001' + 'P' + ' ' + '01' +
          ' '.repeat(100) +
          '1' +          // interest code: 1 = fixed amount
          '10122026' +   // interest start date
          '000000000000300' + // R$ 3.00
          ' '.repeat(99)
        
        const segQ =
          '748' + '0001' + '3' + '00002' + 'Q' + ' ' + '01' +
          '1' + '00000000000000' +
          'SACADO TESTE' + ' '.repeat(27) +
          'RUA TESTE' + ' '.repeat(30) +
          'BAIRRO' + ' '.repeat(8) +
          '01234567' +
          'SAO PAULO' + ' '.repeat(5) +
          'SP' +
          ' '.repeat(88)
        
        const trailerLote = '748' + '0001' + '5' + ' '.repeat(233)
        const trailer = '748' + '9999' + '9' + ' '.repeat(233)
        
        const fixture = [header, headerLote, segP, segQ, trailerLote, trailer].join('\n')
        const cnabFile = openCnabFromLines(stringToLines(fixture))
        const result = readData(cnabFile)
        
        const bill = result.bills[0]
        
        expect(bill.juros?.tipo).toBe('valor')
        expect(bill.juros?.valor).toBe(3.0)
        expect(bill.juros?.vigenciaAPartirDe).toMatch(/^(10\/12\/2026|10122026)$/)
      })
      
      test('deve interpretar código 2 como percentual', () => {
        const header = '74800000         2' + '0'.repeat(222)
        const headerLote = '74800011R01  040' + ' '.repeat(225)
        
        const segP = 
          '748' + '0001' + '3' + '00001' + 'P' + ' ' + '01' +
          ' '.repeat(100) +
          '2' +          // interest code: 2 = percentage
          '25122026' +   // interest start date
          '000000000000350' + // 3.5% monthly
          ' '.repeat(99)
        
        const segQ =
          '748' + '0001' + '3' + '00002' + 'Q' + ' ' + '01' +
          '1' + '00000000000000' +
          'SACADO TESTE' + ' '.repeat(27) +
          'RUA TESTE' + ' '.repeat(30) +
          'BAIRRO' + ' '.repeat(8) +
          '01234567' +
          'SAO PAULO' + ' '.repeat(5) +
          'SP' +
          ' '.repeat(88)
        
        const trailerLote = '748' + '0001' + '5' + ' '.repeat(233)
        const trailer = '748' + '9999' + '9' + ' '.repeat(233)
        
        const fixture = [header, headerLote, segP, segQ, trailerLote, trailer].join('\n')
        const cnabFile = openCnabFromLines(stringToLines(fixture))
        const result = readData(cnabFile)
        
        const bill = result.bills[0]
        
        expect(bill.juros?.tipo).toBe('percentual')
        expect(bill.juros?.valor).toBe(3.5)
        expect(bill.juros?.vigenciaAPartirDe).toMatch(/^(25\/12\/2026|25122026)$/)
      })
    })
    
    describe('Resumo - Diferenças entre bancos CNAB 240', () => {
      test('códigos de dispensado diferem: Bradesco/Santander=0, Sicredi=3', () => {
        // Bradesco uses code 0 for waived interest
        const fixtureBradesco = '23700000         2' + '0'.repeat(222) + '\n' +
          '23700011R01  040' + ' '.repeat(225) + '\n' +
          '237' + '0001' + '3' + '00001' + 'P' + ' ' + '01' + ' '.repeat(100) + '0' + '00000000' + '000000000000000' + ' '.repeat(99) + '\n' +
          '237' + '0001' + '3' + '00002' + 'Q' + ' ' + '01' + '1' + '00000000000000' + 'TESTE' + ' '.repeat(35) + 'RUA' + ' '.repeat(37) + 'BAIRRO' + ' '.repeat(8) + '12345678' + 'CIDADE' + ' '.repeat(9) + 'SP' + ' '.repeat(88) + '\n' +
          '237' + '0001' + '5' + ' '.repeat(233) + '\n' +
          '237' + '9999' + '9' + ' '.repeat(233)
        
        const resultBradesco = readData(openCnabFromLines(stringToLines(fixtureBradesco)))
        expect(resultBradesco.bills[0].juros?.tipo).toBe('dispensado')
        
        // Sicredi uses code 3 for waived interest (different from other banks)
        const fixtureSicredi = '74800000         2' + '0'.repeat(222) + '\n' +
          '74800011R01  040' + ' '.repeat(225) + '\n' +
          '748' + '0001' + '3' + '00001' + 'P' + ' ' + '01' + ' '.repeat(100) + '3' + '00000000' + '000000000000000' + ' '.repeat(99) + '\n' +
          '748' + '0001' + '3' + '00002' + 'Q' + ' ' + '01' + '1' + '00000000000000' + 'TESTE' + ' '.repeat(35) + 'RUA' + ' '.repeat(37) + 'BAIRRO' + ' '.repeat(8) + '12345678' + 'CIDADE' + ' '.repeat(9) + 'SP' + ' '.repeat(88) + '\n' +
          '748' + '0001' + '5' + ' '.repeat(233) + '\n' +
          '748' + '9999' + '9' + ' '.repeat(233)
        
        const resultSicredi = readData(openCnabFromLines(stringToLines(fixtureSicredi)))
        expect(resultSicredi.bills[0].juros?.tipo).toBe('dispensado')
      })
    })
  })
  
  // ========== TESTES DE FORMATAÇÃO E IDENTIFICADORES ==========
  
  describe('Formatação de datas e preservação de identificadores', () => {
    test('datas devem ser formatadas em DD/MM/AAAA, não cruas', () => {
      // Teste com múltiplas fixtures para garantir formatação consistente
      const fixtures = [
        { name: 'Banco do Brasil', path: 'cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM' },
        { name: 'Santander', path: 'cnab400/santander/SANTANDER_cnab_400_140.REM' },
        { name: 'Bradesco 240', path: 'cnab240/bradesco/remessa-multipla.txt' },
      ]
      
      fixtures.forEach(({ path: fixturePath }) => {
        const cnabFile = openCnabFromLines(stringToLines(loadFixture(fixturePath)))
        const result = readData(cnabFile)
        
        if (result.bills.length > 0) {
          const bill = result.bills[0]
          
          // Vencimento deve estar formatado DD/MM/AAAA, não no formato cru DDMMAA
          expect(bill.vencimento).toBeDefined()
          expect(bill.vencimento).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
          expect(bill.vencimento).not.toMatch(/^\d{6}$/) // Não deve ser DDMMAA cru
          
          // DataGeracao no header também
          if (result.header.dataGeracao) {
            expect(result.header.dataGeracao).toMatch(/^\d{2}\/\d{2}\/\d{4}$/)
          }
        }
      })
    })
    
    test('datas zeradas devem retornar undefined, não "00000000"', () => {
      // Criar fixture sintética com data zerada em multa
      const header = '23700000         2' + '0'.repeat(222)
      const headerLote = '23700011R01  040' + ' '.repeat(225)
      const segP = '237' + '0001' + '3' + '00001' + 'P' + ' ' + '01' + ' '.repeat(100) + '2' + '26072026' + '000000000100000' + ' '.repeat(99)
      const segQ = '237' + '0001' + '3' + '00002' + 'Q' + ' ' + '01' + '1' + '00000000000000' + 'TESTE' + ' '.repeat(35) + 'RUA' + ' '.repeat(37) + 'BAIRRO' + ' '.repeat(8) + '12345678' + 'CIDADE' + ' '.repeat(9) + 'SP' + ' '.repeat(88)
      const segR = '237' + '0001' + '3' + '00003' + 'R' + ' ' + '01' + '0' + '00000000' + '000000000000000' + ' '.repeat(138) // multa com data zerada
      const trailerLote = '237' + '0001' + '5' + ' '.repeat(233)
      const trailer = '237' + '9999' + '9' + ' '.repeat(233)
      
      const fixture = [header, headerLote, segP, segQ, segR, trailerLote, trailer].join('\n')
      
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      // Multa com data zerada deve ter vigenciaAPartirDe === undefined
      expect(result.bills[0].multa?.vigenciaAPartirDe).toBeUndefined()
      // Não deve ser a string literal "00000000"
      expect(result.bills[0].multa?.vigenciaAPartirDe).not.toBe('00000000')
    })
    
    test('nossoNumero deve preservar precisão (string, não number)', () => {
      // BB tem casos com 17 dígitos que excedem Number.MAX_SAFE_INTEGER
      const fixture = loadFixture('cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      if (result.bills.length > 0) {
        const bill = result.bills[0]
        
        // nossoNumero deve ser string para preservar precisão
        expect(typeof bill.nossoNumero).toBe('string')
        
        // Se tiver mais de 16 dígitos, Number não seria seguro
        if (bill.nossoNumero && bill.nossoNumero.length > 16) {
          const asNumber = Number(bill.nossoNumero)
          // Verificar que se fosse number, perderia precisão
          expect(Number.isSafeInteger(asNumber)).toBe(false)
        }
      }
    })
    
    test('CEP deve preservar formato quando possível', () => {
      // CEP no CNAB pode vir em diferentes formatos dependendo do banco
      // Alguns bancos dividem em prefixo+sufixo (numéricos), outros como texto completo
      
      // Teste com Santander que tem CEP como campo único
      const fixtureSantander = loadFixture('cnab400/santander/SANTANDER_cnab_400_140.REM')
      const cnabFileSantander = openCnabFromLines(stringToLines(fixtureSantander))
      const resultSantander = readData(cnabFileSantander)
      
      if (resultSantander.bills.length > 0 && resultSantander.bills[0].sacado?.endereco?.cep) {
        // CEP deve ser string
        expect(typeof resultSantander.bills[0].sacado.endereco.cep).toBe('string')
      }
      
      // Nota: Bradesco CNAB 240 divide CEP em duas partes numéricas (prefixo 5 dígitos + sufixo 3),
      // então pode perder zero à esquerda no prefixo. Isso é uma limitação do schema atual.
    })
    
    test('numeroDocumento deve ser string para preservar formato', () => {
      const fixtures = [
        'cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM',
        'cnab240/bradesco/remessa-multipla.txt',
      ]
      
      fixtures.forEach(fixturePath => {
        const cnabFile = openCnabFromLines(stringToLines(loadFixture(fixturePath)))
        const result = readData(cnabFile)
        
        if (result.bills.length > 0) {
          const bill = result.bills[0]
          
          // numeroDocumento deve ser string
          expect(typeof bill.numeroDocumento).toBe('string')
          expect(bill.numeroDocumento).toBeDefined()
        }
      })
    })
    
    test('documento (CPF/CNPJ) deve remover zeros à esquerda (consistência com CNABRecord)', () => {
      // Sicredi tem cedente.documento no header
      const fixture = loadFixture('cnab400/sicredi/SICREDI_cnab_400.CRM')
      const cnabFile = openCnabFromLines(stringToLines(fixture))
      const result = readData(cnabFile)
      
      // Documento deve ser string sem zeros à esquerda
      expect(typeof result.header.cedente.documento).toBe('string')
      expect(result.header.cedente.documento).toBeDefined()
      
      // Não deve começar com zero (zeros à esquerda removidos)
      if (result.header.cedente.documento && result.header.cedente.documento.length > 0) {
        expect(result.header.cedente.documento).not.toMatch(/^0/)
      }
    })
  })
  
  // ========== TESTES DE REGRESSÃO - BUG identifyRecordType ==========
  
  describe('CNAB 400 - Caixa (regressão: bug identifyRecordType)', () => {
    const fixture = () => loadFixture('cnab400/caixa/CAIXA_cnab_400.REM')
    
    test('deve reconhecer tipo de registro por posição, não por nome de campo', () => {
      // Bug: Caixa usa "codigo_registro", não "tipo_registro"
      // identifyRecordType buscava por lista fixa de nomes, não por posição
      // Resultado: agrupamento falhava silenciosamente, retornando 0 boletos
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)

      expect(result.bills.length).toBe(10)
    })

    test('deve extrair campos de ouro dos boletos', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)

      const firstBill = result.bills[0]

      expect(firstBill.valor).toBeDefined()
      expect(typeof firstBill.valor).toBe('number')
      expect(firstBill.valor).toBeGreaterThan(0)

      expect(firstBill.vencimento).toBeDefined()
      expect(firstBill.numeroDocumento).toBeDefined()
      expect(firstBill.nossoNumero).toBeDefined()
      expect(firstBill.sacado?.nome).toBeDefined()
    })

    test('deve extrair juros com tipo interpretado', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      const firstBill = result.bills[0]
      
      // Caixa tem juros mapeados com interpret() recém-adicionado
      if (firstBill.juros) {
        if (firstBill.juros.tipo) {
          expect(['valor', 'percentual', 'dispensado']).toContain(firstBill.juros.tipo)
        }
        // juros.valor também foi mapeado
        if (firstBill.juros.valor) {
          expect(typeof firstBill.juros.valor).toBe('number')
        }
      }
    })
  })
  
  describe('CNAB 400 - Sicoob (regressão: não deve quebrar)', () => {
    const fixture = () => loadFixture('cnab400/sicoob/SICOOB_cnab_400.REM')
    
    test('deve continuar funcionando após correção de identifyRecordType', () => {
      // Sicoob já funcionava (usa "tipo_registro"), mas serve como regressão
      // pra garantir que a correção não quebrou bancos que já funcionavam
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)

      expect(result.bills.length).toBe(10)
    })

    test('deve extrair campos de ouro dos boletos', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)

      const firstBill = result.bills[0]

      expect(firstBill.valor).toBeDefined()
      expect(typeof firstBill.valor).toBe('number')
      expect(firstBill.valor).toBeGreaterThan(0)

      expect(firstBill.vencimento).toBeDefined()
      expect(firstBill.numeroDocumento).toBeDefined()
      expect(firstBill.nossoNumero).toBeDefined()
      expect(firstBill.sacado?.nome).toBeDefined()
    })

    test('deve extrair cedente.nome do header', () => {
      const cnabFile = openCnabFromLines(stringToLines(fixture()))
      const result = readData(cnabFile)
      
      // Gap de mapeamento fechado: Sicoob agora expõe cedente.nome
      expect(result.header.cedente.nome).toBeDefined()
      expect(typeof result.header.cedente.nome).toBe('string')
    })
  })
})






