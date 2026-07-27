/**
 * Schema do Segmento Y-01 - Sicredi CNAB 240
 * 
 * Registro opcional para identificação do Beneficiário Final.
 * 
 * NOTA: O manual Sicredi já usa a nomenclatura correta "Beneficiário Final"
 * conforme Circulares BACEN: 3598, 3656 e 3956, que substituíram a
 * nomenclatura antiga "Sacador/Avalista".
 * 
 * Tipo de registro: 3 (detalhe)
 * Segmento: Y
 * Código do registro: 01
 * 
 * Baseado em:
 * - Manual oficial Sicredi CNAB 240, versão 29 (seção 8 - Arquivo de Remessa)
 * - Layout CNAB 240 versão 081
 */

import { RecordSchema } from '../../../../types'

export const SICREDI_CNAB240_SEGMENT_Y01: RecordSchema = {
  // ========== CONTROLE (1-17) ==========
  controle_banco: {
    pos: [1, 3],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '748',
    description: 'Código FEBRABAN do Sicredi',
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
    description: 'Tipo registro: 3=Detalhe',
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
    pattern: 'Y',
    description: 'Segmento Y = dados adicionais',
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
    description: 'Uso exclusivo CNAB/FEBRABAN',
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
    description: 'Código de movimento (variável)',
    canonical: null,
  },

  // ========== CÓDIGO DO REGISTRO (18-19) ==========
  codigo_registro: {
    pos: [18, 19],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '01',
    description: 'Código do registro: 01=Beneficiário Final',
    canonical: null,
  },

  // ========== DADOS DO BENEFICIÁRIO FINAL (20-155) ==========
  beneficiario_final_tipo_pessoa: {
    pos: [20, 20],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de pessoa: 1=CPF, 2=CNPJ',
    canonical: null,
  },
  beneficiario_final_cpf_cnpj: {
    pos: [21, 35],
    type: 'num',
    size: 15,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'CPF/CNPJ do Beneficiário Final',
    canonical: null,
  },
  beneficiario_final_nome: {
    pos: [36, 75],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Nome do Beneficiário Final (sem acentuação)',
    canonical: null,
  },
  beneficiario_final_endereco: {
    pos: [76, 115],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Endereço do Beneficiário Final',
    canonical: null,
  },
  cnab_exclusivo_2: {
    pos: [116, 130],
    type: 'alfa',
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Sem preenchimento',
    canonical: null,
  },
  beneficiario_final_cep: {
    pos: [131, 138],
    type: 'num',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CEP (8 dígitos)',
    canonical: null,
  },
  beneficiario_final_cidade: {
    pos: [139, 153],
    type: 'alfa',
    size: 15,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Cidade do Beneficiário Final',
    canonical: null,
  },
  beneficiario_final_uf: {
    pos: [154, 155],
    type: 'alfa',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'UF do Beneficiário Final',
    canonical: null,
  },

  // ========== RESERVADO (156-240) ==========
  cnab_exclusivo_3: {
    pos: [156, 240],
    type: 'alfa',
    size: 85,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CNAB (sem preenchimento)',
    canonical: null,
  },
}
