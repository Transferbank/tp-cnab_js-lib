/**
 * Schema do Detalhe - Bradesco CNAB 400 (Remessa)
 *
 * Registro tipo 1 (detalhe) do arquivo de remessa.
 * Contém dados financeiros do título e informações do sacado.
 *
 * Tipo de registro: 1
 *
 * Posições validadas cruzando duas fontes independentes que concordam
 * byte a byte (inclusive contra fixture real):
 * - brcobranca (Ruby) — remessa/cnab400/bradesco.rb
 * - cnab_yaml (YAML) — cnab400/237/remessa/detalhe.yml
 * - Manual "Layout de Cobrança CNAB 400 — versão em português" (27/07/2017)
 * - Manual "Layout de Cobrança CNAB 400 - Padrão 400 posições" (2022) — 
 *   revelou 2 campos nas posições 105 e 107-108
 */

import { RecordSchema } from '../../../../types'

export const BRADESCO_CNAB400_DETAIL: RecordSchema = {
  // ========== IDENTIFICAÇÃO DO REGISTRO (1-1) ==========
  tipo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '1',
    description: 'Tipo do registro: 1=Detalhe',
    canonical: null,
  },

  // ========== AGÊNCIA/CONTA (2-20) ==========
  agencia_debito: {
    pos: [2, 6],
    type: 'num',
    size: 5,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Agência de débito automático (se aplicável)',
    canonical: null,
  },
  agencia_debito_dv: {
    pos: [7, 7],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Dígito verificador da agência de débito',
    canonical: null,
  },
  razao_conta_corrente: {
    pos: [8, 12],
    type: 'num',
    size: 5,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Razão da conta corrente',
    canonical: null,
  },
  conta_corrente: {
    pos: [13, 19],
    type: 'num',
    size: 7,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Conta corrente',
    canonical: null,
  },
  conta_corrente_dv: {
    pos: [20, 20],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Dígito verificador da conta corrente',
    canonical: null,
  },

  // ========== IDENTIFICAÇÃO DA EMPRESA (21-37) ==========
  zeros_1: {
    pos: [21, 21],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '0',
    description: 'Zero fixo',
    canonical: null,
  },
  carteira_codigo: {
    pos: [22, 24],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código da carteira (ex: 109)',
    canonical: null,
  },
  agencia_cedente: {
    pos: [25, 29],
    type: 'num',
    size: 5,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Agência do cedente',
    canonical: null,
  },
  conta_cedente: {
    pos: [30, 36],
    type: 'num',
    size: 7,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Conta do cedente',
    canonical: null,
  },
  conta_cedente_dv: {
    pos: [37, 37],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Dígito verificador da conta do cedente',
    canonical: null,
  },

  // ========== NÚMERO DE CONTROLE DO PARTICIPANTE (38-62) ==========
  numero_controle_empresa: {
    pos: [38, 62],
    type: 'alfa',
    size: 25,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Número de controle do participante (uso da empresa)',
    canonical: null,
  },

  // ========== CÓDIGO DO BANCO (63-65) ==========
  codigo_banco: {
    pos: [63, 65],
    type: 'num',
    size: 3,
    decimals: 0,
    required: true,
    dateFormat: null,
    // Campo condicional (manual 2022, "Das Posições", 063 a 065): '237' quando o
    // pagador optou por Débito Automático em conta, '000' quando não. Não é um valor
    // fixo — não deve travar em '000' via padrao, senão remessas reais com débito
    // automático habilitado ('237') seriam rejeitadas como erro de validação.
    pattern: null,
    description:
      "Código do banco para débito automático: '237' se débito automático em conta contratado, '000' caso contrário",
    canonical: null,
  },

  // ========== MULTA (66-70) ==========
  multa_indicador: {
    pos: [66, 66],
    type: 'num',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '0',
    description: 'Indicador de multa: 0=Sem multa, 2=Com multa',
    canonical: null,
  },
  multa_percentual: {
    pos: [67, 70],
    type: 'num',
    size: 4,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Percentual de multa (2 decimais implícitas)',
    canonical: null,
  },

  // ========== IDENTIFICAÇÃO DO TÍTULO NO BANCO (71-82) ==========
  nosso_numero: {
    pos: [71, 81],
    type: 'num',
    size: 11,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Nosso número (11 dígitos)',
    canonical: 'nossoNumero',
  },
  nosso_numero_dv: {
    pos: [82, 82],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Dígito verificador do nosso número',
    canonical: null,
  },

  // ========== DESCONTO BONIFICAÇÃO (83-92) ==========
  desconto_bonificacao: {
    pos: [83, 92],
    type: 'num',
    size: 10,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Desconto bonificação por dia',
    canonical: null,
  },

  // ========== CONDIÇÃO EMISSÃO/DISTRIBUIÇÃO (93-94) ==========
  condicao_emissao: {
    pos: [93, 93],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '2',
    description: 'Emissão do boleto: 1=Banco, 2=Cliente',
    canonical: null,
  },
  identificacao_debito: {
    pos: [94, 94],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: 'N',
    description: 'Identificação de débito automático: N=Não',
    canonical: null,
  },

  // ========== BRANCOS (95-104) ==========
  brancos_1: {
    pos: [95, 104],
    type: 'alfa',
    size: 10,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Espaços em branco / uso do banco',
    canonical: null,
  },

  // ========== INDICADOR RATEIO CRÉDITO (105-105) ==========
  indicador_rateio_credito: {
    pos: [105, 105],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Indicador de rateio de crédito: "R"=contratado serviço de rateio, branco=sem rateio (revelado no manual 2022, documentado em tipo3-rateio-credito.md)',
    canonical: null,
  },

  // ========== INDICADOR ENDEREÇO PARA AVISO DE DÉBITO (106-106) ==========
  indicador_endereco_debito: {
    pos: [106, 106],
    type: 'num',
    size: 1,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '2',
    description: 'Endereço para aviso de débito: 2=Ignora',
    canonical: null,
  },

  // ========== QUANTIDADE DE PAGAMENTOS (107-108) ==========
  quantidade_pagamentos: {
    pos: [107, 108],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Quantidade de pagamentos (revelado no manual 2022)',
    canonical: null,
  },

  // ========== IDENTIFICAÇÃO DA OCORRÊNCIA (109-110) ==========
  codigo_ocorrencia: {
    pos: [109, 110],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    // Não é um valor fixo: varia por título (01=Entrada de título, 02=Pedido de baixa,
    // 04=Concessão de abatimento, 06=Alteração de vencimento — ver manual para lista completa).
    // Um arquivo real legitimamente mistura esses códigos entre os detalhes.
    pattern: null,
    description: 'Código de ocorrência (01=Entrada, 02=Pedido de baixa, 04=Concessão de abatimento, 06=Alteração de vencimento, etc.)',
    canonical: null,
  },

  // ========== NÚMERO DO DOCUMENTO (111-120) ==========
  numero_documento: {
    pos: [111, 120],
    type: 'alfa',
    size: 10,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número do documento (seu número)',
    canonical: 'numeroDocumento',
  },

  // ========== DATA DE VENCIMENTO (121-126) ==========
  vencimento: {
    pos: [121, 126],
    type: 'data',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: 'DDMMAA',
    pattern: null,
    description: 'Data de vencimento do título',
    canonical: 'vencimento',
  },

  // ========== VALOR DO TÍTULO (127-139) ==========
  valor_titulo: {
    pos: [127, 139],
    type: 'num',
    size: 13,
    decimals: 2,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Valor do título (2 decimais implícitas)',
    canonical: 'valor',
  },

  // ========== BANCO COBRADOR (140-147) ==========
  banco_cobrador: {
    pos: [140, 142],
    type: 'num',
    size: 3,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '000',
    description: 'Código do banco cobrador (000=Bradesco)',
    canonical: null,
  },
  agencia_cobradora: {
    pos: [143, 147],
    type: 'num',
    size: 5,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Agência cobradora',
    canonical: null,
  },

  // ========== ESPÉCIE DO TÍTULO (148-149) ==========
  especie_titulo: {
    pos: [148, 149],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '01',
    description: 'Espécie do título: 01=Duplicata, 02=Nota promissória, etc.',
    canonical: null,
  },

  // ========== ACEITE (150-150) ==========
  aceite: {
    pos: [150, 150],
    type: 'alfa',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: 'N',
    description: 'Aceite: A=Aceite, N=Não aceite',
    canonical: null,
  },

  // ========== DATA DE EMISSÃO (151-156) ==========
  data_emissao: {
    pos: [151, 156],
    type: 'data',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: 'DDMMAA',
    pattern: null,
    description: 'Data de emissão do título',
    canonical: 'dataEmissao',
  },

  // ========== INSTRUÇÕES (157-160) ==========
  instrucao_1: {
    pos: [157, 158],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '00',
    description: 'Primeira instrução de cobrança',
    canonical: null,
  },
  instrucao_2: {
    pos: [159, 160],
    type: 'num',
    size: 2,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: '00',
    description: 'Segunda instrução de cobrança',
    canonical: null,
  },

  // ========== JUROS DE MORA (161-173) ==========
  juros_mora: {
    pos: [161, 173],
    type: 'num',
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor de juros de mora por dia de atraso (2 decimais implícitas)',
    canonical: null,
  },

  // ========== DESCONTO (174-192) ==========
  desconto_data_limite: {
    pos: [174, 179],
    type: 'data',
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAA',
    pattern: null,
    description: 'Data limite para concessão de desconto',
    canonical: null,
  },
  desconto_valor: {
    pos: [180, 192],
    type: 'num',
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor do desconto',
    canonical: 'desconto.valor',
  },

  // ========== IOF (193-205) ==========
  iof_valor: {
    pos: [193, 205],
    type: 'num',
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor do IOF a ser recolhido',
    canonical: null,
  },

  // ========== ABATIMENTO (206-218) ==========
  abatimento_valor: {
    pos: [206, 218],
    type: 'num',
    size: 13,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Valor do abatimento',
    canonical: 'abatimento.valor',
  },

  // ========== DADOS DO SACADO (219-334) ==========
  sacado_codigo_inscricao: {
    pos: [219, 220],
    type: 'num',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Tipo de inscrição: 01=CPF, 02=CNPJ',
    canonical: null,
  },
  sacado_numero_inscricao: {
    pos: [221, 234],
    type: 'num',
    size: 14,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'CPF ou CNPJ do sacado (pagador)',
    canonical: 'sacado.documento',
  },
  nome: {
    pos: [235, 274],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Nome do sacado',
    canonical: 'sacado.nome',
  },
  logradouro: {
    pos: [275, 314],
    type: 'alfa',
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Endereço do sacado',
    canonical: 'sacado.endereco.logradouro',
  },

  // ========== BRANCOS (315-326) ==========
  brancos_3: {
    pos: [315, 326],
    type: 'alfa',
    size: 12,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Espaços em branco / 1ª mensagem',
    canonical: null,
  },

  // ========== CEP (327-334) ==========
  cep: {
    pos: [327, 334],
    type: 'num',
    size: 8,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'CEP do sacado',
    canonical: 'sacado.endereco.cep',
  },

  // ========== SACADOR/AVALISTA OU 2ª MENSAGEM (335-394) ==========
  sacador_avalista: {
    pos: [335, 394],
    type: 'alfa',
    size: 60,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Nome do beneficiário final ou 2ª mensagem de cobrança (nomenclatura atualizada conforme Circulares BACEN 3598, 3656 e 3956)',
    canonical: null,
  },

  // ========== NÚMERO SEQUENCIAL (395-400) ==========
  numero_sequencial: {
    pos: [395, 400],
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial do registro',
    canonical: null,
  },
}
