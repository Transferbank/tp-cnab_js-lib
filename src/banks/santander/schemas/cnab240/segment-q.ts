/**
 * Schema do Segmento Q - Santander CNAB 240
 * 
 * Contém os dados do pagador/sacado (quem vai pagar o boleto):
 * CPF/CNPJ, nome, endereço, CEP, cidade, UF, sacador/avalista,
 * e campos específicos do Santander para carnê/parcelamento.
 * 
 * Tipo de registro: 3 (detalhe)
 * Segmento: Q
 * 
 * Baseado em:
 * - Manual "Layout Padrão 240 – Cobrança, Versão 2.5" (Setembro/2014)
 * - pycnab240, laravel-boleto, brcobranca, cnab_yaml
 */

import { RecordSchema } from '../../../../types'

export const SANTANDER_CNAB240_SEGMENT_Q: RecordSchema = {
  // ========== CONTROLE (1-17) ==========
  controle_banco: {
    pos: [1, 3],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '033',
    description: 'Código FEBRABAN do Santander',
    canonical: null,
  },
  controle_lote: {
    pos: [4, 7],
    type: 'num',
    size: 4,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número do lote',
    canonical: null,
  },
  controle_registro: {
    pos: [8, 8],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '3',
    description: 'Tipo: 3=Detalhe',
    canonical: null,
  },
  servico_numero_registro: {
    pos: [9, 13],
    type: 'num',
    size: 5,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial do registro no lote',
    canonical: null,
  },
  servico_segmento: {
    pos: [14, 14],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'Q',
    description: 'Segmento Q = dados do pagador',
    canonical: null,
  },
  cnab_exclusivo_1: {
    pos: [15, 15],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },
  servico_codigo_movimento: {
    pos: [16, 17],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código de movimento da remessa (variável: 01=Entrada, 02=Baixa, 04=Abatimento, etc.)',
    canonical: null,
  },

  // ========== DADOS DO SACADO/PAGADOR (18-153) ==========
  sacado_inscricao_tipo: {
    pos: [18, 18],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de inscrição: 1=CPF, 2=CNPJ',
    canonical: null,
  },
  sacado_inscricao_numero: {
    pos: [19, 33],
    type: 'num',
    size: 15,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'CPF ou CNPJ do pagador',
    canonical: 'sacado.documento',
  },
  sacado_nome: {
    pos: [34, 73],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Nome do pagador',
    canonical: 'sacado.nome',
  },
  sacado_endereco: {
    pos: [74, 113],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Endereço do pagador',
    canonical: 'sacado.endereco.logradouro',
  },
  sacado_bairro: {
    pos: [114, 128],
    type: 'alfa',
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Bairro do pagador',
    canonical: 'sacado.endereco.bairro',
  },
  sacado_cep: {
    pos: [129, 133],
    type: 'num',
    size: 5,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CEP (5 primeiros dígitos)',
    canonical: 'sacado.endereco.cep',
  },
  sacado_cep_sufixo: {
    pos: [134, 136],
    type: 'num',
    size: 3,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CEP (sufixo - 3 últimos dígitos)',
    canonical: null,
  },
  sacado_cidade: {
    pos: [137, 151],
    type: 'alfa',
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Cidade do pagador',
    canonical: 'sacado.endereco.cidade',
  },
  sacado_uf: {
    pos: [152, 153],
    type: 'alfa',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'UF do pagador',
    canonical: 'sacado.endereco.estado',
  },

  // ========== DADOS DO BENEFICIÁRIO FINAL (154-209) ==========
  // Nota: Manual 2023 renomeia "Sacador/Avalista" para "Beneficiário Final"
  beneficiario_final_inscricao_tipo: {
    pos: [154, 154],
    type: 'num',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '0',
    description: 'Tipo de inscrição Beneficiário Final: 0=Sem, 1=CPF, 2=CNPJ',
    canonical: null,
  },
  beneficiario_final_inscricao_numero: {
    pos: [155, 169],
    type: 'num',
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CPF ou CNPJ do Beneficiário Final (antigo Sacador/Avalista)',
    canonical: null,
  },
  beneficiario_final_nome: {
    pos: [170, 209],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Nome do Beneficiário Final (antigo Sacador/Avalista)',
    canonical: null,
  },

  // ========== RESERVADO (210-221) - Manual 2023 ==========
  // Nota: O manual 2023 documenta esta faixa como "Reservado (brancos)".
  // As 4 fontes de terceiros consultadas (pycnab240, laravel-boleto, brcobranca, cnab_yaml)
  // e o manual 2014 documentam campos reais aqui (carnê/parcelamento).
  // Mantidos como "Reservado" conforme manual mais recente.
  cnab_reservado_1: {
    pos: [210, 221],
    type: 'num',
    size: 12,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (brancos) - Manual 2023. Versões anteriores: campos de carnê/parcelamento',
    canonical: null,
  },

  // ========== RESERVADO (222-240) ==========
  cnab_exclusivo_2: {
    pos: [222, 240],
    type: 'alfa',
    size: 19,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },
}
