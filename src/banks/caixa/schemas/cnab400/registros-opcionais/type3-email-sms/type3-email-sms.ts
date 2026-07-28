/**
 * Caixa Econômica Federal (104) — CNAB 400 — Registro Tipo 3 (Envio por E-mail/SMS)
 *
 * Registro opcional que informa o e-mail e/ou celular do pagador para que o boleto
 * (ou aviso relacionado) seja enviado por e-mail e/ou SMS, em vez de (ou além de)
 * impresso fisicamente.
 *
 * Fonte:
 * - Manual oficial Caixa (caixa_layout_CNAB_400_2024.pdf, 2024)
 *
 * REGISTRO NÃO CONFIRMADO POR TERCEIROS: laravel-boleto não implementa este registro.
 * Todas as posições vêm exclusivamente do manual oficial de 2024.
 *
 * PARTICULARIDADES:
 * - codigo_registro='3' é INFERIDO do contexto, não confirmado explicitamente pela
 *   tabela do manual. Vale confirmar contra um arquivo real antes de tratar como
 *   certeza absoluta.
 * - dados_destinatario (posição 54-103, 50 caracteres) é o campo de e-mail — o manual
 *   não especifica um formato/validação além do tamanho.
 * - tipo_mensagem_sms (posição 115) tem uma Nota Explicativa própria (NE060) no manual
 *   que não foi extraída em detalhe — vale consultar o PDF original antes de implementar
 *   lógica que dependa do valor exato desse campo.
 */

import { RecordSchema, FieldType } from '@tp-types/index'

export const TYPE3_EMAIL_SMS: RecordSchema = {
  codigo_registro: {
    pos: [1, 1],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '3',
    description:
      'Identificação do registro tipo 3 (inferido do contexto — ver comentário no cabeçalho)',
    canonical: null,
  },
  tipo_inscricao_empresa: {
    pos: [2, 3],
    type: FieldType.NUM,
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de inscrição da empresa: 1=CPF, 2=CNPJ',
    canonical: null,
  },
  numero_inscricao_empresa: {
    pos: [4, 17],
    type: FieldType.NUM,
    size: 14,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Número de inscrição da empresa (CPF/CNPJ do beneficiário)',
    canonical: null,
  },
  codigo_agencia: {
    pos: [18, 21],
    type: FieldType.NUM,
    size: 4,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Código da agência de vinculação do beneficiário',
    canonical: null,
  },
  codigo_beneficiario: {
    pos: [22, 28],
    type: FieldType.NUM,
    size: 7,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Identificação da empresa na CAIXA',
    canonical: null,
  },
  brancos_1: {
    pos: [29, 53],
    type: FieldType.ALFA,
    size: 25,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Em branco',
    canonical: null,
  },
  dados_destinatario: {
    pos: [54, 103],
    type: FieldType.ALFA,
    size: 50,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description:
      'E-mail para envio da informação — o manual não especifica formato/validação além do tamanho',
    canonical: null,
  },
  codigo_ddd: {
    pos: [104, 105],
    type: FieldType.ALFA,
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'DDD do celular do destinatário',
    canonical: null,
  },
  numero_celular: {
    pos: [106, 114],
    type: FieldType.ALFA,
    size: 9,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Número do celular, para envio de SMS',
    canonical: null,
  },
  tipo_mensagem_sms: {
    pos: [115, 115],
    type: FieldType.ALFA,
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description:
      'Tipo de mensagem SMS — Ver Nota Explicativa NE060 no manual (não detalhada nesta extração)',
    canonical: null,
  },
  brancos_2: {
    pos: [116, 394],
    type: FieldType.ALFA,
    size: 279,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Em branco',
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
