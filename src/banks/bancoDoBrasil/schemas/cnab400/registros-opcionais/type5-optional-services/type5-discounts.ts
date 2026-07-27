/**
 * Banco do Brasil (001) — CNAB 400 — Registro Tipo 5, Serviço '07' (2º e 3º Descontos)
 *
 * Registro opcional que especifica 2º e 3º descontos. Deve ser enviado imediatamente
 * após o registro detalhe (tipo 7) ao qual se refere, quando o comando do detalhe
 * for '01' (Registro de Título) e os campos 174-192 do detalhe (data/valor do 1º desconto)
 * já estiverem preenchidos.
 *
 * Fonte:
 * - Manual oficial BB 2024 (banco_do_brasil_2024_cnab400.pdf, jun/2024) — p.8, nota 39
 *
 * REGISTRO NOVO: não presente no manual de 2012 nem em bibliotecas de terceiros
 * (brcobranca, laravel-boleto). Revelado apenas no manual 2024 para convênios > 1.000.000.
 *
 * PARTICULARIDADES:
 * - Só válido quando o 1º desconto (posições 174-192 do detalhe tipo 7) já estiver preenchido
 * - Se o detalhe tiver '777777' nas posições 174-179 (desconto por dia de antecipação),
 *   2º e 3º descontos NÃO são aceitos
 * - As datas de 2º e 3º descontos não podem ser posteriores à data de vencimento
 *   nem à data do desconto anterior
 * - Os valores de 2º e 3º descontos devem ser menores que o desconto anterior
 * - Usar zeros nas datas/valores quando não houver o respectivo desconto
 */

import { RecordSchema } from '../../../../../../types'

export const TYPE5_DISCOUNTS: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: 'num',
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
    type: 'alfa',
    size: 2,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '07',
    description: 'Código do serviço: 07=2º e 3º Descontos',
    canonical: null,
  },
  data_limite_2_desconto: {
    pos: [4, 9],
    type: 'data',
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAA',
    pattern: null,
    description:
      'Data limite para concessão do 2º desconto. Não pode ser posterior à data de vencimento do título nem à data do desconto anterior. Zeros se não houver',
    canonical: null,
  },
  valor_2_desconto: {
    pos: [10, 26],
    type: 'num',
    size: 17,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description:
      'Valor do 2º desconto, menor que o desconto anterior. Zeros se não houver desconto',
    canonical: null,
  },
  data_limite_3_desconto: {
    pos: [27, 32],
    type: 'data',
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAA',
    pattern: null,
    description:
      'Data limite para concessão do 3º desconto. Não pode ser posterior à data de vencimento do título nem à data do desconto anterior. Zeros se não houver',
    canonical: null,
  },
  valor_3_desconto: {
    pos: [33, 49],
    type: 'num',
    size: 17,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description:
      'Valor do 3º desconto, menor que o desconto anterior. Zeros se não houver desconto',
    canonical: null,
  },
  brancos: {
    pos: [50, 394],
    type: 'alfa',
    size: 345,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description: 'Complemento de registro (brancos)',
    canonical: null,
  },
  numero_sequencial: {
    pos: [395, 400],
    type: 'num',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description: 'Número sequencial do registro no arquivo',
    canonical: null,
  },
}
