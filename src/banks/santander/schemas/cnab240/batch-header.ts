/**
 * Schema do Header de Lote - Santander CNAB 240
 * 
 * Primeira linha de cada lote. Agrupa títulos (boletos) que pertencem
 * ao mesmo tipo de serviço (cobrança, pagamento, etc.).
 * 
 * Tipo de registro: 1
 * Lote: número sequencial (0001, 0002, ...)
 * 
 * Baseado em:
 * - Manual "Layout Padrão 240 – Cobrança, Versão 2.5" (Setembro/2014)
 * - pycnab240, laravel-boleto, brcobranca, cnab_yaml
 */

import { RecordSchema } from '../../../../types'

export const SANTANDER_CNAB240_BATCH_HEADER: RecordSchema = {
  // ========== CONTROLE (1-8) ==========
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
    description: 'Número sequencial do lote (0001, 0002...)',
    canonical: null,
  },
  controle_registro: {
    pos: [8, 8],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '1',
    description: 'Tipo: 1=Header de Lote',
    canonical: null,
  },

  // ========== SERVIÇO (9-17) ==========
  servico_operacao: {
    pos: [9, 9],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'R',
    description: 'Tipo de operação: R=Remessa, T=Retorno',
    canonical: null,
  },
  servico_tipo: {
    pos: [10, 11],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '01',
    description: 'Tipo de serviço: 01=Cobrança',
    canonical: null,
  },
  servico_forma: {
    pos: [12, 13],
    type: 'alfa',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco) - Manual 2023: brancos',
    canonical: null,
  },
  servico_layout: {
    pos: [14, 16],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '030',
    description: 'Versão do layout do lote (030 para CNAB 240 - Manual 2023)',
    canonical: null,
  },
  cnab_exclusivo_1: {
    pos: [17, 17],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },

  // ========== DADOS DO CEDENTE (18-53) ==========
  cedente_inscricao_tipo: {
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
  cedente_inscricao_numero: {
    pos: [19, 33],
    type: 'num',
    size: 15,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número do CPF/CNPJ do cedente',
    canonical: null,
  },
  cnab_exclusivo_2: {
    pos: [34, 53],
    type: 'alfa',
    size: 20,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },

  // ========== CÓDIGO DE TRANSMISSÃO (54-68) ==========
  codigo_transmissao: {
    pos: [54, 68],
    type: 'num',
    size: 15,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código de transmissão (agência + "0000" + código do cliente)',
    canonical: null,
  },

  // ========== RESERVADO (69-73) ==========
  cnab_exclusivo_3: {
    pos: [69, 73],
    type: 'alfa',
    size: 5,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },

  // ========== NOME DO CEDENTE (74-103) ==========
  cedente_nome: {
    pos: [74, 103],
    type: 'alfa',
    size: 30,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Nome da empresa/cedente',
    canonical: null,
  },

  // ========== MENSAGEM/INFORMAÇÃO (104-183) ==========
  mensagem_1: {
    pos: [104, 143],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Mensagem 1 para todos os boletos do lote',
    canonical: null,
  },
  mensagem_2: {
    pos: [144, 183],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Mensagem 2 para todos os boletos do lote',
    canonical: null,
  },

  // ========== NÚMERO DA REMESSA/RETORNO (184-191) ==========
  numero_remessa_retorno: {
    pos: [184, 191],
    type: 'num',
    size: 8,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial da remessa ou retorno',
    canonical: null,
  },

  // ========== DATA DE GRAVAÇÃO (192-199) ==========
  data_gravacao: {
    pos: [192, 199],
    type: 'data',
    size: 8,
    decimals: 0,
    required: true,
    dateFormat: 'DDMMAAAA',
    pattern: null,
    description: 'Data de gravação do lote',
    canonical: null,
  },

  // ========== RESERVADO (200-240) ==========
  cnab_exclusivo_4: {
    pos: [200, 240],
    type: 'alfa',
    size: 41,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },
}
