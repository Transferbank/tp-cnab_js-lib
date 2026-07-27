/**
 * Banco do Brasil (001) — CNAB 400 — Registro Tipo 5, Serviço '99' (Multa)
 *
 * Registro opcional que especifica multa de cobrança. Deve ser enviado imediatamente
 * após o registro detalhe (tipo 7) ao qual se refere, quando o comando do detalhe
 * for '01' (Registro de Título).
 *
 * Fonte:
 * - Manual oficial BB remessa (Doc2627CBR641Pos7.pdf, abril/2012) — §3 p.7, notas 14-17 p.14-15
 * - Manual oficial BB 2024 (banco_do_brasil_2024_cnab400.pdf, jun/2024) — campo
 *   dias_recebimento_apos_vencimento revelado para convênios > 1.000.000
 * - brcobranca (remessa/cnab400/banco_brasil.rb:154-161)
 * - laravel-boleto (Cnab/Remessa/Cnab400/Banco/Bb.php:340-347)
 *
 * PARTICULARIDADES:
 * - campo `valor_percentual_multa` tem 12 posições com 2 decimais implícitas
 * - a semântica das 2 decimais muda conforme `codigo_multa`:
 *   - '1' (valor): valor monetário com 2 decimais (ex: 000000010050 = R$ 100,50)
 *   - '2' (percentual): 5 inteiros + 2 decimais (ex: 000000000250 = 2,50%)
 *   - '9' (dispensar): campo deve ser zerado
 * - campo `dias_recebimento_apos_vencimento`: só usar quando comando='01' no detalhe;
 *   após esse prazo o boleto é baixado automaticamente; espécie 32 (boleto proposta)
 *   não aceita esse campo
 */

import { RecordSchema } from '../../../../../../types'

export const TYPE5_FINE: RecordSchema = {
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
    pattern: '99',
    description: 'Código do serviço: 99=Cobrança de Multa',
    canonical: null,
  },
  codigo_multa: {
    pos: [4, 4],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: null,
    description:
      "Código da multa: 1=Valor fixo, 2=Percentual, 9=Dispensar cobrança de multa",
    canonical: {
      field: 'multa.tipo',
      interpret: (value: unknown) => {
        const code = Number(value)
        if (code === 1) return 'valor'
        if (code === 2) return 'percentual'
        if (code === 9) return 'dispensado'
        return undefined
      },
    },
  },
  data_inicio_multa: {
    pos: [5, 10],
    type: 'data',
    size: 6,
    decimals: 0,
    required: false,
    dateFormat: 'DDMMAA',
    pattern: null,
    description: 'Data a partir da qual a multa é cobrada (zeros se codigo_multa=9)',
    canonical: 'multa.vigenciaAPartirDe',
  },
  valor_percentual_multa: {
    pos: [11, 22],
    type: 'num',
    size: 12,
    decimals: 2,
    required: false,
    dateFormat: null,
    pattern: null,
    description:
      'Valor ou percentual da multa: se codigo_multa=1 então valor monetário com 2 decimais; se codigo_multa=2 então percentual (5 inteiros + 2 decimais); zeros se codigo_multa=9',
    canonical: 'multa.valor',
  },
  dias_recebimento_apos_vencimento: {
    pos: [23, 25],
    type: 'num',
    size: 3,
    decimals: 0,
    required: false,
    dateFormat: null,
    pattern: null,
    description:
      'Quantidade de dias para recebimento após vencimento — só usar quando comando=01 no detalhe; após esse prazo o boleto é baixado automaticamente; espécie 32 (boleto proposta) não aceita esse campo (revelado no manual 2024)',
    canonical: null,
  },
  brancos: {
    pos: [26, 394],
    type: 'alfa',
    size: 369,
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
