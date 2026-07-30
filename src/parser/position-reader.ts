/**
 * Leitura de posições fixas FEBRABAN em linhas CNAB.
 * Centraliza acesso a campos por posição, evitando "magic numbers" espalhados.
 */

/**
 * CNAB 400: tipo de registro na posição 1 (0-indexed = charAt(0)).
 * Valores típicos: '0' (header), '1' ou '7' (detalhe), '9' (trailer).
 */
export function getCnab400RecordType(line: string): string {
  return line.charAt(0)
}

/**
 * CNAB 240: tipo de registro na posição 8 (0-indexed = charAt(7)).
 * Valores: '0' (header arquivo), '1' (header lote), '3' (detalhe), '5' (trailer lote), '9' (trailer arquivo).
 */
export function getCnab240RecordType(line: string): string {
  return line.charAt(7)
}

/**
 * CNAB 240: código do segmento na posição 14 (0-indexed = charAt(13)).
 * Valores comuns: 'P', 'Q', 'R', 'S', 'Y'.
 * Só válido quando tipo registro = '3' (detalhe).
 */
export function getCnab240SegmentCode(line: string): string {
  return line.charAt(13)
}
