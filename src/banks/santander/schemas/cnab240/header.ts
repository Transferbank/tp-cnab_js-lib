/**
 * Schema do Header de Arquivo - Santander CNAB 240
 * 
 * Primeira linha do arquivo CNAB. Contém identificação do banco,
 * dados do cedente (beneficiário) e informações sobre o arquivo.
 * 
 * Tipo de registro: 0
 * Lote: 0000
 * 
 * Baseado em:
 * - Manual "Layout Padrão 240 – Cobrança, Versão 2.5" (Setembro/2014)
 * - pycnab240, laravel-boleto, brcobranca, cnab_yaml
 */

import { RecordSchema } from '../../../../types'

export const SANTANDER_CNAB240_FILE_HEADER: RecordSchema = {
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
    pattern: '0000',
    description: 'Lote 0000 = header de arquivo',
    canonical: null,
  },
  controle_registro: {
    pos: [8, 8],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '0',
    description: 'Tipo: 0=Header de Arquivo',
    canonical: null,
  },

  // ========== RESERVADO (9-16) ==========
  cnab_exclusivo_1: {
    pos: [9, 16],
    type: 'alfa',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },

  // ========== DADOS DO CEDENTE (17-47) ==========
  cedente_inscricao_tipo: {
    pos: [17, 17],
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
    pos: [18, 32],
    type: 'num',
    size: 15,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número do CPF/CNPJ do cedente',
    canonical: 'cedente.documento',
  },
  codigo_transmissao: {
    pos: [33, 47],
    type: 'num',
    size: 15,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código de transmissão (agência + "0000" + código do cliente)',
    canonical: null,
  },

  // ========== RESERVADO (48-72) ==========
  cnab_exclusivo_2: {
    pos: [48, 72],
    type: 'alfa',
    size: 25,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },

  // ========== IDENTIFICAÇÃO (73-142) ==========
  cedente_nome: {
    pos: [73, 102],
    type: 'alfa',
    size: 30,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Nome da empresa/cedente',
    canonical: 'cedente.nome',
  },
  nome_do_banco: {
    pos: [103, 132],
    type: 'alfa',
    size: 30,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: 'BANCO SANTANDER',
    description: 'Nome do banco',
    canonical: null,
  },
  cnab_exclusivo_3: {
    pos: [133, 142],
    type: 'alfa',
    size: 10,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },

  // ========== ARQUIVO (143-166) ==========
  arquivo_codigo: {
    pos: [143, 143],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '1',
    description: 'Código do arquivo: 1=Remessa, 2=Retorno',
    canonical: null,
  },
  arquivo_data_de_geracao: {
    pos: [144, 151],
    type: 'data',
    size: 8,
    decimals: 0,
    required: true,
    dateFormat: 'DDMMAAAA',
    pattern: null,
    description: 'Data de geração do arquivo',
    canonical: null,
  },
  cnab_exclusivo_4: {
    pos: [152, 157],
    type: 'alfa',
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Uso exclusivo FEBRABAN/CNAB (hora não existe no Santander)',
    canonical: null,
  },
  arquivo_sequencia: {
    pos: [158, 163],
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial do arquivo',
    canonical: null,
  },
  arquivo_layout: {
    pos: [164, 166],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '040',
    description: 'Versão do layout (040 para CNAB 240)',
    canonical: null,
  },

  // ========== RESERVADO (167-240) ==========
  // Manual 2023: bloco único "Reservado (uso Banco)", brancos. Versões anteriores
  // do schema subdividiam essa faixa em densidade/reservado_banco/reservado_empresa,
  // mas o manual e a maioria das fontes de terceiros (pycnab240, laravel-boleto)
  // tratam como um campo único de 74 bytes.
  cnab_exclusivo_5: {
    pos: [167, 240],
    type: 'alfa',
    size: 74,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Reservado (uso Banco) - Manual 2023',
    canonical: null,
  },
}
