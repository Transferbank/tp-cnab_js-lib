/**
 * Helper para Segmento S - Sicredi CNAB 240
 * 
 * Funções auxiliares para identificar e parsear as variantes do Segmento S:
 * - Variante 1 (Frente/Verso do boleto): tipo_impressao = '1' ou '2'
 * - Variante 2 (Corpo de instruções): tipo_impressao = '3'
 */

import { extractLineFields } from '@parser/field-extractor'
import { ParsedLine } from '@tp-types/index'
import {
  SICREDI_CNAB240_SEGMENT_S,
  SICREDI_CNAB240_SEGMENT_S_FRONT_BACK,
  SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS,
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
 * @returns 'frente_verso' | 'corpo_instrucoes' | { error: string }
 */
export function identifySegmentSVariant(
  line: string,
): 'frente_verso' | 'corpo_instrucoes' | { error: string } {
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

  if (printType === '1' || printType === '2') return 'frente_verso'
  if (printType === '3') return 'corpo_instrucoes'

  return { error: `Tipo de impressão inválido: "${printType}"` }
}

/**
 * Parseia um Segmento S aplicando o schema correto baseado na variante
 */
export function parseSegmentS(line: string): ParsedLine {
  const variant = identifySegmentSVariant(line)

  if (typeof variant === 'object' && 'error' in variant) {
    // Retorna campos base com erro
    const baseFields = extractLineFields(line, SICREDI_CNAB240_SEGMENT_S)
    return {
      ...baseFields,
      _erro_variante: { raw: '', value: '', error: variant.error, canonical: null },
    }
  }

  if (variant === 'frente_verso') {
    return extractLineFields(line, SICREDI_CNAB240_SEGMENT_S_FRONT_BACK)
  }

  // variant === 'corpo_instrucoes'
  return extractLineFields(line, SICREDI_CNAB240_SEGMENT_S_BODY_INSTRUCTIONS)
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

  if (variant === 'frente_verso') {
    // Variante 1: apenas uma mensagem (pos 21-100)
    const msg = fields.mensagem?.value
    if (msg && typeof msg === 'string' && msg.trim()) {
      messages.push(msg.trim())
    }
  } else {
    // Variante 2: mensagens 1-3 (pos 21-138)
    for (let i = 1; i <= 3; i++) {
      const msg = fields[`mensagem_${i}`]?.value
      if (msg && typeof msg === 'string' && msg.trim()) {
        messages.push(msg.trim())
      }
    }
  }

  return messages
}
