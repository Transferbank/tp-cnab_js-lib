/**
 * Testes para format-detector
 */

import { detectFormat, detectBank } from '../../src/parser/format-detector'

describe('detectFormat', () => {
  describe('Detecção de CNAB 240', () => {
    test('deve detectar formato CNAB 240 pelo tamanho da linha', () => {
      const line240 = 'A'.repeat(240)
      const lines = [line240]

      const format = detectFormat(lines)

      expect(format).toBe('cnab240')
    })

    test('deve detectar CNAB 240 mesmo com múltiplas linhas', () => {
      const lines = [
        'A'.repeat(240),
        'B'.repeat(240),
        'C'.repeat(240),
      ]

      const format = detectFormat(lines)

      expect(format).toBe('cnab240')
    })
  })

  describe('Detecção de CNAB 400', () => {
    test('deve detectar formato CNAB 400 pelo tamanho da linha', () => {
      const line400 = 'B'.repeat(400)
      const lines = [line400]

      const format = detectFormat(lines)

      expect(format).toBe('cnab400')
    })

    test('deve detectar CNAB 400 mesmo com múltiplas linhas', () => {
      const lines = [
        'A'.repeat(400),
        'B'.repeat(400),
        'C'.repeat(400),
      ]

      const format = detectFormat(lines)

      expect(format).toBe('cnab400')
    })
  })

  describe('Casos inválidos', () => {
    test('deve retornar null para array vazio', () => {
      const format = detectFormat([])

      expect(format).toBeNull()
    })

    test('deve retornar null para linha com tamanho incorreto', () => {
      const lines = ['linha muito curta']

      const format = detectFormat(lines)

      expect(format).toBeNull()
    })

    test('deve retornar null para linha de 241 caracteres', () => {
      const lines = ['A'.repeat(241)]

      const format = detectFormat(lines)

      expect(format).toBeNull()
    })

    test('deve retornar null para linha de 239 caracteres', () => {
      const lines = ['A'.repeat(239)]

      const format = detectFormat(lines)

      expect(format).toBeNull()
    })

    test('deve retornar null para linha de 401 caracteres', () => {
      const lines = ['A'.repeat(401)]

      const format = detectFormat(lines)

      expect(format).toBeNull()
    })

    test('deve retornar null para linha de 399 caracteres', () => {
      const lines = ['A'.repeat(399)]

      const format = detectFormat(lines)

      expect(format).toBeNull()
    })

    test('deve retornar null quando não há linhas', () => {
      const format = detectFormat(null as any)

      expect(format).toBeNull()
    })
  })

  describe('Comportamento com linhas reais', () => {
    test('deve detectar CNAB 240 de arquivo real', () => {
      const headerReal = '033'.padEnd(240, ' ')
      const lines = [headerReal]

      expect(headerReal.length).toBe(240)
      const format = detectFormat(lines)

      expect(format).toBe('cnab240')
    })

    test('deve detectar CNAB 400 de arquivo real', () => {
      const headerReal = '0         REMESSA        Empresa Exemplo                '.padEnd(400, ' ')
      const lines = [headerReal]

      expect(headerReal.length).toBe(400)
      const format = detectFormat(lines)

      expect(format).toBe('cnab400')
    })
  })
})

describe('detectBank', () => {
  describe('Detecção de banco em CNAB 400', () => {
    test('deve extrair código do banco da posição 77-79', () => {
      // Posições 1-76: outros dados, 77-79: código do banco (033), 80-400: resto
      const header = 'X'.repeat(76) + '033' + 'Y'.repeat(321)

      const bankCode = detectBank(header, 'cnab400')

      expect(bankCode).toBe('033')
    })

    test('deve retornar código de banco Santander (033)', () => {
      const header = ' '.repeat(76) + '033' + ' '.repeat(321)

      const bankCode = detectBank(header, 'cnab400')

      expect(bankCode).toBe('033')
    })

    test('deve retornar código de banco Bradesco (237)', () => {
      const header = 'X'.repeat(76) + '237' + 'Y'.repeat(321)

      const bankCode = detectBank(header, 'cnab400')

      expect(bankCode).toBe('237')
    })

    test('deve fazer trim em espaços no código do banco', () => {
      const header = 'X'.repeat(76) + ' 33' + 'Y'.repeat(321)

      const bankCode = detectBank(header, 'cnab400')

      expect(bankCode).toBe('33')
    })

    test('deve retornar null quando código do banco está vazio', () => {
      const header = 'X'.repeat(76) + '   ' + 'Y'.repeat(321)

      const bankCode = detectBank(header, 'cnab400')

      expect(bankCode).toBeNull()
    })
  })

  describe('Detecção de banco em CNAB 240', () => {
    test('deve extrair código do banco da posição 1-3', () => {
      const header = '033' + 'Y'.repeat(237)

      const bankCode = detectBank(header, 'cnab240')

      expect(bankCode).toBe('033')
    })

    test('deve retornar código de banco Santander (033)', () => {
      const header = '03300000         200000001234567890123456789Nome da Empresa' + ' '.repeat(180)

      const bankCode = detectBank(header, 'cnab240')

      expect(bankCode).toBe('033')
    })

    test('deve retornar código de banco Bradesco (237)', () => {
      const header = '237' + 'X'.repeat(237)

      const bankCode = detectBank(header, 'cnab240')

      expect(bankCode).toBe('237')
    })

    test('deve retornar código de banco Itaú (341)', () => {
      const header = '341' + 'X'.repeat(237)

      const bankCode = detectBank(header, 'cnab240')

      expect(bankCode).toBe('341')
    })

    test('deve fazer trim em espaços no código do banco', () => {
      const header = ' 33' + 'X'.repeat(237)

      const bankCode = detectBank(header, 'cnab240')

      expect(bankCode).toBe('33')
    })

    test('deve retornar null quando código do banco está vazio', () => {
      const header = '   ' + 'X'.repeat(237)

      const bankCode = detectBank(header, 'cnab240')

      expect(bankCode).toBeNull()
    })
  })

  describe('Casos inválidos', () => {
    test('deve retornar null para header vazio', () => {
      const bankCode = detectBank('', 'cnab240')

      expect(bankCode).toBeNull()
    })

    test('deve retornar null para header null', () => {
      const bankCode = detectBank(null as any, 'cnab240')

      expect(bankCode).toBeNull()
    })

    test('deve retornar null para header undefined', () => {
      const bankCode = detectBank(undefined as any, 'cnab400')

      expect(bankCode).toBeNull()
    })
  })

  describe('Comparação entre formatos', () => {
    test('deve extrair de posições diferentes dependendo do formato', () => {
      // Linha com códigos diferentes nas posições CNAB 240 e CNAB 400
      const header = '123' + 'X'.repeat(73) + '456' + 'Y'.repeat(321)

      const code240 = detectBank(header, 'cnab240')
      const code400 = detectBank(header, 'cnab400')

      expect(code240).toBe('123') // Posições 1-3
      expect(code400).toBe('456') // Posições 77-79
    })
  })

  describe('Bancos conhecidos', () => {
    const bancosConhecidos = [
      { codigo: '001', nome: 'Banco do Brasil' },
      { codigo: '033', nome: 'Santander' },
      { codigo: '104', nome: 'Caixa Econômica Federal' },
      { codigo: '237', nome: 'Bradesco' },
      { codigo: '341', nome: 'Itaú' },
      { codigo: '748', nome: 'Sicredi' },
    ]

    bancosConhecidos.forEach(({ codigo, nome }) => {
      test(`deve detectar código do ${nome} (${codigo}) em CNAB 240`, () => {
        const header = codigo + 'X'.repeat(237)
        const bankCode = detectBank(header, 'cnab240')
        expect(bankCode).toBe(codigo)
      })

      test(`deve detectar código do ${nome} (${codigo}) em CNAB 400`, () => {
        const header = 'X'.repeat(76) + codigo + 'Y'.repeat(321)
        const bankCode = detectBank(header, 'cnab400')
        expect(bankCode).toBe(codigo)
      })
    })
  })
})
