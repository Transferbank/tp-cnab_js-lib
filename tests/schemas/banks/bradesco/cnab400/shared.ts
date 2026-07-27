/**
 * Helpers compartilhados para testes do Bradesco CNAB 400
 */

import * as fs from 'fs'
import * as path from 'path'

export const FIXTURES_DIR = path.join(__dirname, '../../../../fixtures/cnab400/bradesco')

/**
 * Lê arquivo fixture
 */
export function readFixture(filename: string): string[] {
  const filePath = path.join(FIXTURES_DIR, filename)
  const content = fs.readFileSync(filePath, 'latin1')
  return content.split(/\r?\n/).filter(line => line.length > 0)
}

/**
 * Calcula o dígito verificador do nosso número usando o algoritmo módulo-11 do Bradesco.
 * 
 * Algoritmo documentado na lib `brcobranca` (Ruby), `remessa/cnab400/bradesco.rb`.
 *
 * Fórmula:
 * 1. Concatena carteira (3 dígitos) + nosso_numero (11 dígitos)
 * 2. Multiplica cada dígito (da direita para esquerda) pela sequência cíclica [2,3,4,5,6,7]
 * 3. Soma todos os produtos
 * 4. Calcula o resto da divisão por 11
 * 5. DV = 11 - resto
 * 6. Se DV = 10, retorna 'P'; se DV = 11, retorna '0'
 * 
 * @param carteiraMaisNossoNumero String com 14 caracteres: carteira (3) + nosso_numero (11)
 * @returns Dígito verificador ('0'-'9' ou 'P')
 */
export function calcularDvNossoNumero(carteiraMaisNossoNumero: string): string {
  if (carteiraMaisNossoNumero.length !== 14) {
    throw new Error(`Esperado 14 caracteres (carteira 3 + nosso_numero 11), recebido ${carteiraMaisNossoNumero.length}`)
  }

  const multiplicadores = [2, 3, 4, 5, 6, 7]
  let soma = 0

  // Processa da direita para esquerda
  for (let i = carteiraMaisNossoNumero.length - 1, multIdx = 0; i >= 0; i--, multIdx++) {
    const digito = parseInt(carteiraMaisNossoNumero[i], 10)
    const multiplicador = multiplicadores[multIdx % multiplicadores.length]
    soma += digito * multiplicador
  }

  const resto = soma % 11
  const dv = 11 - resto

  // Mapeamento especial do Bradesco
  if (dv === 10) return 'P'
  if (dv === 11) return '0'
  return dv.toString()
}

/**
 * Converte string em formato monetário brasileiro para número.
 * 
 * Exemplos:
 * - "1.234,59" → 1234.59
 * - "123,45" → 123.45
 * - "1.234.567,89" → 1234567.89
 * 
 * @param valorBR String no formato brasileiro (separador de milhar: '.', decimal: ',')
 * @returns Número decimal
 */
export function parseReais(valorBR: string): number {
  return parseFloat(valorBR.replace(/\./g, '').replace(',', '.'))
}
