/**
 * Bradesco CNAB 240 - Segmento Y-04
 * 
 * Registro Detalhe - Segmento Y-04 (Informações de Contato e PIX)
 * 
 * Registro opcional (Remessa/Retorno) que traz informações de contato do destinatário
 * (e-mail e celular) e dados de PIX para pagamento alternativo.
 * 
 * IMPORTANTE: Este segmento é o mais recente adicionado ao manual oficial Bradesco
 * (versão 04, dez/2024) e inclui os campos de PIX (tipo de chave, chave/URL do QR Code,
 * TXID). Este registro NÃO existe em versões antigas do manual nem no pycnab240 vendorizado
 * no projeto.
 * 
 * Estrutura:
 *   - Controle: banco (237), lote, registro tipo 3 (detalhe), segmento 'Y'
 *   - Código de registro opcional: '03' (identifica que é o Y-04, nomenclatura Bradesco)
 *   - Dados de contato: e-mail, celular (DDD + número)
 *   - Dados PIX: tipo de chave (1=CPF/CNPJ, 2=Email, 3=Celular, 4=Aleatória),
 *                chave PIX ou URL do QR Code, TXID
 * 
 * Fonte: Manual oficial Bradesco CNAB 240, versão 04, dez/2024
 * Seção: "Registro Detalhe - Segmento Y-04"
 */

import { RecordSchema } from '../../../../types'

export const BRADESCO_CNAB240_SEGMENT_Y04: RecordSchema = {
  controle_banco: {
    pos: [1, 3],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '237',
    description: 'Código FEBRABAN do Bradesco',
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
    description: 'Lote de serviço',
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
    pattern: 'Y',
    description: 'Segmento Y = registro opcional',
    canonical: null,
  },
  cnab_exclusivo_1: {
    pos: [15, 15],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '',
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
    description: 'Código de movimento da remessa',
    canonical: null,
  },
  codigo_registro_opcional: {
    pos: [18, 19],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '03',
    description: 'Código do registro opcional: 03=Y-04 (informações de contato e PIX)',
    canonical: null,
  },
  destinatario_email: {
    pos: [20, 69],
    type: 'alfa',
    size: 50,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Endereço de e-mail do destinatário/pagador',
    canonical: null,
  },
  destinatario_celular_ddd: {
    pos: [70, 71],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'DDD do celular do destinatário/pagador',
    canonical: null,
  },
  destinatario_celular_numero: {
    pos: [72, 80],
    type: 'num',
    size: 9,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Número do celular do destinatário/pagador (9 dígitos)',
    canonical: null,
  },
  pix_tipo_chave: {
    pos: [81, 81],
    type: 'num',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de chave PIX: 0=Não informado, 1=CPF/CNPJ, 2=Email, 3=Celular, 4=Chave aleatória',
    canonical: null,
  },
  pix_chave_ou_url: {
    pos: [82, 158],
    type: 'alfa',
    size: 77,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Chave PIX ou URL do QR Code PIX',
    canonical: null,
  },
  pix_txid: {
    pos: [159, 193],
    type: 'alfa',
    size: 35,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'TXID (identificador da transação PIX)',
    canonical: null,
  },
  cnab_exclusivo_2: {
    pos: [194, 240],
    type: 'alfa',
    size: 47,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '',
    description: 'Uso exclusivo FEBRABAN/CNAB',
    canonical: null,
  },
}
