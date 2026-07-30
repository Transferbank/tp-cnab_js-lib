/**
 * Helper para Segmento S - Santander CNAB 240
 * 
 * Funções auxiliares para identificar e parsear as variantes do Segmento S:
 * - Variante 1 (Formulário Especial): identificacao_impressao = '1'
 * - Variante 2 (Mensagens fixas): identificacao_impressao = '2'
 */

import { extractLineFields } from '@parser/field-extractor'
import { ParsedLine } from '@tp-types/index'
import {
  SANTANDER_CNAB240_SEGMENT_S,
  SANTANDER_CNAB240_SEGMENT_S_FORM,
  SANTANDER_CNAB240_SEGMENT_S_MESSAGES,
} from './segment-s'

/**
 * Verifica se uma linha é um Segmento S válido
 */
export function isSegmentS(line: string): boolean {
  if (line.length !== 240) return false
  if (line[7] !== '3') return false  // tipo de registro = 3 (detalhe)
  if (line[13] !== 'S') return false // segmento = S
  return true
}

/**
 * Identifica qual variante do Segmento S pela posição 18
 * @returns 'formulario' | 'mensagens' | { error: string }
 */
export function identifySegmentSVariant(
  line: string,
): 'formulario' | 'mensagens' | { error: string } {
  if (line.length !== 240) {
    return { error: 'Linha não tem 240 caracteres' }
  }
  if (line[7] !== '3') {
    return { error: 'Tipo de registro incorreto (esperado 3)' }
  }
  if (line[13] !== 'S') {
    return { error: 'Segmento incorreto (esperado S)' }
  }

  const printType = line[17] // position 18 (index 17)

  if (printType === '1') return 'formulario'
  if (printType === '2') return 'mensagens'

  return { error: `Tipo de impressão inválido: "${printType}"` }
}

/**
 * Parseia um Segmento S aplicando o schema correto baseado na variante
 */
export function parseSegmentS(line: string): ParsedLine {
  const variant = identifySegmentSVariant(line)

  if (typeof variant === 'object' && 'error' in variant) {
    // Retorna campos base com erro
    const baseFields = extractLineFields(line, SANTANDER_CNAB240_SEGMENT_S)
    return {
      ...baseFields,
      _erro_variante: { raw: '', value: '', error: variant.error, canonical: null },
    }
  }

  if (variant === 'formulario') {
    return extractLineFields(line, SANTANDER_CNAB240_SEGMENT_S_FORM)
  }

  // variant === 'mensagens'
  return extractLineFields(line, SANTANDER_CNAB240_SEGMENT_S_MESSAGES)
}

/**
 * Extrai mensagens de um Segmento S, retornando array de strings não vazias
 */
export function extractSegmentSMessages(line: string): string[] {
  if (!isSegmentS(line)) return []

  const variant = identifySegmentSVariant(line)
  if (typeof variant === 'object' && 'error' in variant) return []

  const fields = parseSegmentS(line)
  const messages: string[] = []

  if (variant === 'formulario') {
    // Variante 1: apenas uma mensagem (pos 22-121)
    const msg = fields.mensagem_impressa?.value
    const msgIsValid = msg !== null && msg !== undefined && typeof msg === 'string' && msg.trim().length > 0
    if (msgIsValid) {
      messages.push(msg.trim())
    }
  } else {
    // Variante 2: mensagens 5-9 (pos 19-218)
    for (let i = 5; i <= 9; i++) {
      const msg = fields[`mensagem_${i}`]?.value
      const msgIsValid = msg !== null && msg !== undefined && typeof msg === 'string' && msg.trim().length > 0
      if (msgIsValid) {
        messages.push(msg.trim())
      }
    }
  }

  return messages
}
