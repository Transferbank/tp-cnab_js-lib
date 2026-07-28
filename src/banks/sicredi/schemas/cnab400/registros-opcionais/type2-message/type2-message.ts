/**
 * Sicredi (748) — CNAB 400 — Registro Tipo 2 (Mensagem)
 *
 * Registro opcional de texto livre (até 4 linhas de 80 caracteres) para impressão no boleto.
 * Instruções de juros/multa/desconto/protesto/negativação NÃO precisam ser cadastradas aqui —
 * já são impressas automaticamente pelo sistema a partir dos campos de negócio do detalhe.
 *
 * Fonte:
 * - Manual oficial Sicredi CNAB 400 (2026_03_12_manual_cnab_400_30.pdf, v3.0, fev/2026) — §8.3, p.31
 * - laravel-boleto (Cnab/Remessa/Cnab400/Banco/Sicredi.php) confirma uma versão simplificada
 *   (só emitida quando byte==1 do boleto — condição não documentada no manual)
 *
 * Ver: src/schemas/banks/sicredi/cnab400/registros-opcionais/tipo2/tipo2-mensagem.md
 */

import { RecordSchema, FieldType } from '@tp-types/index'

export const TYPE2_MESSAGE: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '2',
    description: 'Identificação do registro mensagem',
    canonical: null,
  },
  brancos_1: {
    pos: [2, 12],
    type: FieldType.ALFA,
    size: 11,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Brancos (complemento de registro)',
    canonical: null,
  },
  nosso_numero: {
    pos: [13, 21],
    type: FieldType.NUM,
    size: 9,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Nosso número — pode ficar em branco se impressão pelo Sicredi',
    canonical: null,
  },
  instrucao_linha_1: {
    pos: [22, 101],
    type: FieldType.ALFA,
    size: 80,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: '1ª linha de instrução de impressão',
    canonical: null,
  },
  instrucao_linha_2: {
    pos: [102, 181],
    type: FieldType.ALFA,
    size: 80,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: '2ª linha de instrução de impressão',
    canonical: null,
  },
  instrucao_linha_3: {
    pos: [182, 261],
    type: FieldType.ALFA,
    size: 80,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: '3ª linha de instrução de impressão',
    canonical: null,
  },
  instrucao_linha_4: {
    pos: [262, 341],
    type: FieldType.ALFA,
    size: 80,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: '4ª linha de instrução de impressão',
    canonical: null,
  },
  numero_documento: {
    pos: [342, 351],
    type: FieldType.ALFA,
    size: 10,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Seu número — deve bater com posições 111-120 do detalhe',
    canonical: null,
  },
  brancos_2: {
    pos: [352, 394],
    type: FieldType.ALFA,
    size: 43,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Brancos (complemento de registro)',
    canonical: null,
  },
  numero_sequencial: {
    pos: [395, 400],
    type: FieldType.NUM,
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial do registro no arquivo',
    canonical: null,
  },
}
