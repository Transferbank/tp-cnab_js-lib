/**
 * Helper para parsing do Segmento S do Bradesco CNAB 240
 * 
 * O Segmento S possui duas variantes mutuamente exclusivas baseadas no campo
 * `tipo_impressao` (posição 18). Este helper identifica a variante e retorna
 * o schema correto para parsing das posições 19-240.
 */

import { RecordSchema, ParsedField } from '../../../../types'
import { extractLineFields } from '../../../../parser/field-extractor'
import {
  BRADESCO_CNAB240_SEGMENT_S_MESSAGE,
  BRADESCO_CNAB240_SEGMENT_S_INFO,
} from './segment-s'

/**
 * Tipo de impressão do Segmento S
 */
export enum SegmentSPrintType {
  /** Mensagem livre de até 140 caracteres (variante A) */
  MENSAGEM_LIVRE_TIPO_1 = '1',
  /** Mensagem livre de até 140 caracteres (variante A) */
  MENSAGEM_LIVRE_TIPO_2 = '2',
  /** Cinco blocos de informação fixos (variante B) */
  BLOCOS_INFORMACAO = '3',
}

/**
 * Informações sobre a variante do Segmento S
 */
export interface SegmentSVariantInfo {
  /** Tipo de impressão identificado */
  tipoImpressao: string
  /** Nome da variante (A ou B) */
  variante: 'A' | 'B'
  /** Descrição da variante */
  description: string
  /** Schema completo para parsing */
  schema: RecordSchema
  /** Se a linha é válida como Segmento S */
  isValid: boolean
  /** Mensagem de erro caso não seja válida */
  error?: string
}

/**
 * Resultado do parsing do Segmento S com informações da variante
 */
export interface ParsedSegmentS {
  /** Informações sobre a variante identificada */
  variant: SegmentSVariantInfo
  /** Campos parseados */
  fields: Record<string, ParsedField>
}

/**
 * Verifica se uma linha CNAB é um Segmento S válido
 * 
 * @param line - Linha CNAB de 240 caracteres
 * @returns true se a linha é um Segmento S válido
 * 
 * @example
 * ```typescript
 * const line = '2370001300001S 01012MENSAGEM...'
 * if (isSegmentS(line)) {
 *   const result = parseSegmentS(line)
 *   console.log('Mensagens:', extractSegmentSMessages(line))
 * }
 * ```
 */
export function isSegmentS(line: string): boolean {
  if (!line || line.length !== 240) {
    return false
  }

  const tipoRegistro = line.charAt(7)
  const segmento = line.charAt(13)

  return tipoRegistro === '3' && segmento === 'S'
}

/**
 * Identifica a variante do Segmento S a partir da linha CNAB
 * 
 * @param line - Linha CNAB de 240 caracteres
 * @returns Informações sobre a variante identificada
 * 
 * @example
 * ```typescript
 * const line = '2370001300001S 01012MENSAGEM PARA IMPRESSAO NO BOLETO...'
 * const variantInfo = identifySegmentSVariant(line)
 * 
 * console.log(variantInfo.variante) // 'A'
 * console.log(variantInfo.descricao) // 'Mensagem livre'
 * ```
 */
export function identifySegmentSVariant(line: string): SegmentSVariantInfo {
  // Validações básicas
  if (!line || line.length !== 240) {
    return {
      tipoImpressao: '',
      variante: 'A',
      description: 'Linha inválida',
      schema: BRADESCO_CNAB240_SEGMENT_S_MESSAGE,
      isValid: false,
      error: `Linha deve ter 240 caracteres, encontrado ${line?.length || 0}`,
    }
  }

  // Verificar se é realmente um Segmento S usando a função dedicada
  if (!isSegmentS(line)) {
    const tipoRegistro = line.charAt(7)
    const segmento = line.charAt(13)
    
    return {
      tipoImpressao: '',
      variante: 'A',
      description: 'Não é um Segmento S',
      schema: BRADESCO_CNAB240_SEGMENT_S_MESSAGE,
      isValid: false,
      error: `Esperado registro tipo 3, segmento S. Encontrado: tipo ${tipoRegistro}, segmento ${segmento}`,
    }
  }

  // Extract print type (position 18, 1-indexed)
  const printType = line.charAt(17).trim()

  // Identify variant
  switch (printType) {
    case SegmentSPrintType.MENSAGEM_LIVRE_TIPO_1:
    case SegmentSPrintType.MENSAGEM_LIVRE_TIPO_2:
      return {
        tipoImpressao: printType,
        variante: 'A',
        description: 'Mensagem livre (até 140 caracteres)',
        schema: BRADESCO_CNAB240_SEGMENT_S_MESSAGE,
        isValid: true,
      }

    case SegmentSPrintType.BLOCOS_INFORMACAO:
      return {
        tipoImpressao: printType,
        variante: 'B',
        description: 'Blocos de informação fixos (5 blocos de 40 caracteres)',
        schema: BRADESCO_CNAB240_SEGMENT_S_INFO,
        isValid: true,
      }

    default:
      return {
        tipoImpressao: printType,
        variante: 'A',
        description: 'Tipo de impressão desconhecido',
        schema: BRADESCO_CNAB240_SEGMENT_S_MESSAGE,
        isValid: false,
        error: `Tipo de impressão inválido: "${printType}". Esperado: 1, 2 ou 3`,
      }
  }
}

/**
 * Parseia uma linha de Segmento S identificando automaticamente a variante
 * e retornando os campos parseados com informações detalhadas
 * 
 * @param line - Linha CNAB de 240 caracteres
 * @returns Objeto com informações da variante e campos parseados
 * 
 * @example
 * ```typescript
 * // Variante A (mensagem livre)
 * const lineA = '2370001300001S 01012MENSAGEM PARA IMPRESSAO NO BOLETO...'
 * const resultA = parseSegmentS(lineA)
 * 
 * console.log(resultA.variant.variante) // 'A'
 * console.log(resultA.fields.mensagem.value) // 'MENSAGEM PARA IMPRESSAO NO BOLETO'
 * console.log(resultA.fields.numero_linha.value) // 12
 * 
 * // Variante B (blocos de informação)
 * const lineB = '2370001300001S 03INFO 5                                INFO 6...'
 * const resultB = parseSegmentS(lineB)
 * 
 * console.log(resultB.variant.variante) // 'B'
 * console.log(resultB.fields.informacao_5.value) // 'INFO 5'
 * console.log(resultB.fields.informacao_6.value) // 'INFO 6'
 * ```
 */
export function parseSegmentS(line: string): ParsedSegmentS {
  const variant = identifySegmentSVariant(line)
  const fields = variant.isValid ? extractLineFields(line, variant.schema) : {}

  return {
    variant,
    fields,
  }
}

/**
 * Extrai apenas as mensagens de impressão de uma linha de Segmento S,
 * independente da variante
 * 
 * @param line - Linha CNAB de 240 caracteres
 * @returns Array de mensagens não vazias
 * 
 * @example
 * ```typescript
 * // Variante A
 * const lineA = '2370001300001S 01012MENSAGEM DE TESTE                  ...'
 * const messagesA = extractSegmentSMessages(lineA)
 * // ['MENSAGEM DE TESTE']
 * 
 * // Variante B
 * const lineB = '2370001300001S 03INFO 5                                INFO 6...'
 * const messagesB = extractSegmentSMessages(lineB)
 * // ['INFO 5', 'INFO 6', ...]
 * ```
 */
export function extractSegmentSMessages(line: string): string[] {
  const parsed = parseSegmentS(line)

  if (!parsed.variant.isValid) {
    return []
  }

  const messages: string[] = []

  if (parsed.variant.variante === 'A') {
    // Variante A: uma única mensagem
    const mensagem = parsed.fields.mensagem?.value
    if (mensagem && typeof mensagem === 'string' && mensagem.trim()) {
      messages.push(mensagem.trim())
    }
  } else {
    // Variante B: cinco blocos de informação
    for (let i = 5; i <= 9; i++) {
      const campo = `informacao_${i}`
      const info = parsed.fields[campo]?.value
      if (info && typeof info === 'string' && info.trim()) {
        messages.push(info.trim())
      }
    }
  }

  return messages
}

