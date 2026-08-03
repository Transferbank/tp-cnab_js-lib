/**
 * Banco do Brasil (001) — CNAB 400 — Registro Tipo 5, Serviço '08' (Agente Negativador)
 *
 * Registro opcional que especifica o agente negativador. Deve ser enviado imediatamente
 * após o registro detalhe (tipo 7) ao qual se refere, quando usado junto com:
 * - comando/codigo_ocorrencia = '01' (Registro de Título) + instrução codificada = '88', ou
 * - comandos '85'/'86' (Inclusão/Exclusão de negativação sem protesto)
 *
 * Fonte:
 * - Manual oficial BB 2024 (banco_do_brasil_2024_cnab400.pdf, jun/2024) — p.8-9, nota 40
 *
 * REGISTRO NOVO: não presente no manual de 2012 nem em bibliotecas de terceiros
 * (brcobranca, laravel-boleto). Revelado apenas no manual 2024 para convênios > 1.000.000.
 *
 * PARTICULARIDADES:
 * - Agentes suportados: '10'=Serasa, '11'=Quod
 * - ATENÇÃO: o manual 2024 não mostra numero_sequencial explícito neste registro
 *   (mostra apenas brancos[6,400]). Por consistência com as outras 4 variantes de
 *   registro tipo 5 (que todas têm numero_sequencial[395,400]), assumimos que a
 *   estrutura correta é brancos[6,394] + numero_sequencial[395,400]. Essa é uma
 *   INFERÊNCIA baseada no padrão geral, não uma confirmação direta do PDF original.
 *   Se necessário, conferir visualmente p.8-9 do PDF para confirmação definitiva.
 */

import { RecordSchema, FieldType } from '@/types/all-types'

export const TYPE5_CREDIT_BUREAU: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: FieldType.NUM,
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '5',
    description: 'Identificação do registro tipo 5',
    canonical: null,
  },
  tipo_servico: {
    pos: [2, 3],
    type: FieldType.NUM,
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '08',
    description: 'Código do serviço: 08=Negativação',
    canonical: null,
  },
  codigo_agente_negativador: {
    pos: [4, 5],
    type: FieldType.NUM,
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Código do agente negativador: 10=Serasa, 11=Quod',
    canonical: null,
  },
  brancos: {
    pos: [6, 394],
    type: FieldType.ALFA,
    size: 389,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Complemento de registro (brancos)',
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
    description:
      'Número sequencial do registro no arquivo (inferido por consistência com outras variantes tipo 5; manual 2024 não mostra explicitamente)',
    canonical: null,
  },
}
