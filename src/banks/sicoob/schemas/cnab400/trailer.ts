/**
 * Sicoob / Bancoob (756) � CNAB 400 � Trailer de Arquivo (Remessa)
 * Cooperativa de cr�dito, nosso n�mero 12 d�gitos (com DV).
 *
 * Fontes:
 * - Planilha oficial Sicoob (Layout_Cobranca_CNAB400 (1).xls, mai/2025)
 * - cnab_yaml (fonte original, concordante)
 * Particularidade estrutural do Sicoob (achado exclusivo):
 * Diferente de todos os outros bancos do projeto, o Sicoob embute 5 blocos de mensagem
 * de 40 caracteres cada DIRETAMENTE NO TRAILER (posi��es 195-394), em vez de usar
 * registros opcionais separados (tipo 2/5/etc.).
 * Essas mensagens s� s�o preenchidas quando instrucao_1=01 E instrucao_2=01 no detalhe
 * (ambos simultaneamente) � caso contr�rio, ficam em branco.
 *
 */

import { RecordSchema, FieldType } from '@tp-types/index'

export const TRAILER: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '9',
    description: 'Identifica��o do trailer',
    canonical: null,
  },
  brancos: {
    pos: [2, 194],
    type: FieldType.ALFA,
    size: 193,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Espa�os em branco',
    canonical: null,
  },
  mensagem_responsabilidade_1: {
    pos: [195, 234],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Primeira mensagem/instru��o de responsabilidade do benefici�rio (preenchido apenas se instrucao_1=01 E instrucao_2=01 no detalhe)',
    canonical: null,
  },
  mensagem_responsabilidade_2: {
    pos: [235, 274],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Segunda mensagem/instru��o de responsabilidade do benefici�rio (preenchido apenas se instrucao_1=01 E instrucao_2=01 no detalhe)',
    canonical: null,
  },
  mensagem_responsabilidade_3: {
    pos: [275, 314],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Terceira mensagem/instru��o de responsabilidade do benefici�rio (preenchido apenas se instrucao_1=01 E instrucao_2=01 no detalhe)',
    canonical: null,
  },
  mensagem_responsabilidade_4: {
    pos: [315, 354],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Quarta mensagem/instru��o de responsabilidade do benefici�rio (preenchido apenas se instrucao_1=01 E instrucao_2=01 no detalhe)',
    canonical: null,
  },
  mensagem_responsabilidade_5: {
    pos: [355, 394],
    type: FieldType.ALFA,
    size: 40,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Quinta mensagem/instru��o de responsabilidade do benefici�rio (preenchido apenas se instrucao_1=01 E instrucao_2=01 no detalhe)',
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
    description: 'N�mero sequencial do registro (incrementa 1 a cada registro)',
    canonical: null,
  },
}
