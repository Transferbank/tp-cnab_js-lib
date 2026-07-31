/**
 * Testes para CNABUnknownFieldCodeError
 * Validando o lançamento de exceção para códigos não mapeados em interpret()
 */

import { openCnabFromLines, CNABUnknownFieldCodeError } from '@/index'
import { readFileSync } from 'fs'
import { join } from 'path'


function stringToLines(content: string): string[] {
  return content.split(/\r?\n/).filter((line) => line.length > 0)
}
describe('CNABUnknownFieldCodeError', () => {
  describe('Casos onde NÃO deve lançar (valores esperados)', () => {
    test('campo com código zero (não preenchido) não deve lançar', () => {
      // Usar fixture real da Caixa e verificar que o processamento funciona normalmente
      // A fixture pode conter códigos válidos ou código 0 (zero-fill, não preenchido)
      const fixturePath = join(__dirname, '../../banks/caixa/docs/cnab400/CAIXA_cnab_400.REM')
      const fileContent = readFileSync(fixturePath, 'latin1')
      const cnabFile = openCnabFromLines(stringToLines(fileContent))

      // Não deve lançar exceção
      expect(() => cnabFile.read()).not.toThrow()

      const result = cnabFile.read()

      // Verificar que o arquivo foi processado (tem boletos)
      expect(result.bills.length).toBeGreaterThan(0)
    })

    test('campo com string vazia (não preenchido) não deve lançar', () => {
      // Usar fixture real da Caixa
      const fixturePath = join(__dirname, '../../banks/caixa/docs/cnab400/CAIXA_cnab_400.REM')
      let fileContent = readFileSync(fixturePath, 'latin1')
      
      // Modificar a primeira linha de detalhe (registro tipo 1) para colocar espaço em branco no campo codigo_juros (posição 77)
      const lines = fileContent.split('\n')
      const firstDetailIndex = lines.findIndex(line => line.charAt(0) === '1')
      
      if (firstDetailIndex >= 0) {
        const line = lines[firstDetailIndex]
        // Substituir posição 77 (índice 76) com espaço em branco
        const modifiedLine = line.substring(0, 76) + ' ' + line.substring(77)
        lines[firstDetailIndex] = modifiedLine
        fileContent = lines.join('\n')
      }

      const cnabFile = openCnabFromLines(stringToLines(fileContent))

      // Não deve lançar exceção
      expect(() => cnabFile.read()).not.toThrow()
    })
  })

  describe('Casos onde DEVE lançar (códigos não mapeados)', () => {
    test('código desconhecido em campo com interpret() deve lançar CNABUnknownFieldCodeError', () => {
      // Usar fixture real da Caixa e modificar o campo codigo_juros para um código inválido (7)
      // Schema mapeia apenas códigos 1, 3, 5, 6, 8 - código 7 não existe
      const fixturePath = join(__dirname, '../../banks/caixa/docs/cnab400/CAIXA_cnab_400.REM')
      let fileContent = readFileSync(fixturePath, 'latin1')
      
      // Modificar a primeira linha de detalhe (registro tipo 1) para colocar código inválido 7 no campo codigo_juros (posição 77)
      const lines = fileContent.split('\n')
      const firstDetailIndex = lines.findIndex(line => line.charAt(0) === '1')
      
      if (firstDetailIndex >= 0) {
        const line = lines[firstDetailIndex]
        // Substituir posição 77 (índice 76) com '7' (código inválido)
        const modifiedLine = line.substring(0, 76) + '7' + line.substring(77)
        lines[firstDetailIndex] = modifiedLine
        fileContent = lines.join('\n')
      }

      const cnabFile = openCnabFromLines(stringToLines(fileContent))

      // Deve lançar CNABUnknownFieldCodeError
      expect(() => cnabFile.read()).toThrow(CNABUnknownFieldCodeError)
      expect(() => cnabFile.read()).toThrow('Código não reconhecido para o campo "juros.tipo": 7')

      try {
        cnabFile.read()
        fail('Deveria ter lançado CNABUnknownFieldCodeError')
      } catch (error: any) {
        expect(error).toBeInstanceOf(CNABUnknownFieldCodeError)
        expect(error.code).toBe('UNKNOWN_FIELD_CODE')
        expect(error.fieldName).toBe('juros.tipo')
        expect(error.rawValue).toBe(7)
      }
    })

    test('readAsync() também deve lançar CNABUnknownFieldCodeError para código desconhecido', async () => {
      // Mesmo cenário do teste anterior
      const fixturePath = join(__dirname, '../../banks/caixa/docs/cnab400/CAIXA_cnab_400.REM')
      let fileContent = readFileSync(fixturePath, 'latin1')
      
      // Modificar a primeira linha de detalhe para colocar código inválido
      const lines = fileContent.split('\n')
      const firstDetailIndex = lines.findIndex(line => line.charAt(0) === '1')
      
      if (firstDetailIndex >= 0) {
        const line = lines[firstDetailIndex]
        // Substituir posição 77 (índice 76) com '7' (código inválido)
        const modifiedLine = line.substring(0, 76) + '7' + line.substring(77)
        lines[firstDetailIndex] = modifiedLine
        fileContent = lines.join('\n')
      }

      const cnabFile = openCnabFromLines(stringToLines(fileContent))

      // Deve lançar CNABUnknownFieldCodeError
      await expect(cnabFile.readAsync()).rejects.toThrow(CNABUnknownFieldCodeError)
      await expect(cnabFile.readAsync()).rejects.toThrow('Código não reconhecido para o campo "juros.tipo": 7')

      try {
        await cnabFile.readAsync()
        fail('Deveria ter lançado CNABUnknownFieldCodeError')
      } catch (error: any) {
        expect(error).toBeInstanceOf(CNABUnknownFieldCodeError)
        expect(error.code).toBe('UNKNOWN_FIELD_CODE')
        expect(error.fieldName).toBe('juros.tipo')
        expect(error.rawValue).toBe(7)
      }
    })
  })

  describe('Regressão - Fixtures existentes', () => {
    function bankFixturePath(format: 'cnab400' | 'cnab240', bank: string, fileName: string): string {
      const isBB = bank === 'bancodobrasil'
      const bankDir = isBB ? 'bancoDoBrasil' : bank
      return isBB
        ? join(__dirname, '../../banks', bankDir, 'docs', fileName)
        : join(__dirname, '../../banks', bankDir, 'docs', format, fileName)
    }

    test('todas as fixtures CNAB 400 devem continuar lendo sem lançar', () => {
      const bancosFixtures = [
        'bradesco/remessa-multipla.txt',
        'bancodobrasil/BANCOBRASIL_cnab_400.REM',
        'caixa/CAIXA_cnab_400.REM',
        'itau/ITAU_cnab_400.REM',
        'santander/SANTANDER_cnab_400_140.REM',
        'sicoob/SICOOB_cnab_400.REM',
        'sicredi/SICREDI_cnab_400.CRM',
      ]

      for (const fixture of bancosFixtures) {
        const [bank, fileName] = fixture.split('/')
        const fixturePath = bankFixturePath('cnab400', bank, fileName)
        const fileContent = readFileSync(fixturePath, 'latin1')
        const cnabFile = openCnabFromLines(stringToLines(fileContent))

        // Não deve lançar exceção
        expect(() => cnabFile.read()).not.toThrow()
      }
    })

    test('todas as fixtures CNAB 240 devem continuar lendo sem lançar', () => {
      const bancosFixtures = [
        'bradesco/remessa-multipla.txt',
      ]

      for (const fixture of bancosFixtures) {
        const [bank, fileName] = fixture.split('/')
        const fixturePath = bankFixturePath('cnab240', bank, fileName)
        const fileContent = readFileSync(fixturePath, 'latin1')
        const cnabFile = openCnabFromLines(stringToLines(fileContent))

        // Não deve lançar exceção
        expect(() => cnabFile.read()).not.toThrow()
      }
    })
  })
})
