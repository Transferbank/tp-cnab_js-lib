# Registro Tipo 3 — Rateio de Crédito (Remessa e Retorno, opcional)

> Fonte: manual oficial Bradesco, `4008-524-0121-layout-cobranca-versao-portugues.pdf` (revisado 27/07/2017), "Lay-out do Arquivo-Remessa - Registro de Transação-Tipo 3 — Rateio de Crédito (opcional)" (p.12-13/57). Posições extraídas via `pdftotext`. O manual também documenta uma variante deste registro para o **arquivo de retorno** ("Registro de Transação - Tipo 3 - Rateio de Crédito"), com layout próprio não coberto neste documento (focado em remessa).

## O que é

Registro inteiro separado, opcional, que permite ao cedente **ratear o crédito de um título entre até 3 beneficiários por registro** (o manual não indica explicitamente quantos registros tipo 3 são aceitos por título, ao contrário do tipo 4 do Itaú que limita a 3 registros/42 contas). O manual lista este registro na composição do arquivo-remessa como `Registro 3 - Rateio de Crédito (opcional)`.

## Regras importantes (manual)

- A posição **105 do registro de detalhe (tipo 1)** funciona como indicador de rateio: deve conter a letra `R` se a empresa contratou o serviço de rateio de crédito; caso contrário, informar branco.
- Se a posição 105 do tipo 1 for `R` mas o título **não** vier acompanhado de um registro tipo 3, ou vice-versa (105 diferente de `R` mas acompanhado de tipo 3), a remessa de rateio é **rejeitada** (motivos 02 e 03 da tabela de ocorrência 02 "Entrada Confirmada").
- `codigo_calculo_rateio` (posição 30) define a base do rateio: `1` = valor cobrado, `2` = valor do registro, `3` = rateio pelo menor valor.
- `tipo_valor_informado` (posição 31) define se os valores de rateio de cada beneficiário são percentuais (`1`) ou valores monetários (`2`) — todos os beneficiários do mesmo registro devem usar o mesmo tipo (motivo de rejeição 26: "Beneficiários informados em percentual e outros em valor").
- A soma dos valores/percentuais de rateio não pode ultrapassar o valor do título (motivo de rejeição 27), nem a soma dos percentuais ultrapassar 100% (motivo 28).
- `codigo_banco` de cada beneficiário é fixo `237` — o serviço de rateio do Bradesco só credita para contas do próprio banco.
- Existe também um layout de **Rateio de Crédito no arquivo de retorno** (mesmo nome de registro, posições diferentes), usado para confirmar/rejeitar o rateio e informar acertos — fora do escopo deste documento, focado na remessa.

## Campos fixos (posições 1-43)

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'3'` | Identificação do registro (rateio de crédito) |
| `identificacao_empresa` | [2,17] | alfa | 16 | 0 | true | null | Carteira + Agência + Conta Corrente do beneficiário no banco (bloco, ver Obs. p.23) |
| `identificacao_titulo` | [18,29] | num | 12 | 0 | true | null | Identificação do título no banco (Nosso Número, ver Obs. p.23) |
| `codigo_calculo_rateio` | [30,30] | alfa | 1 | 0 | true | null | `'1'`=valor cobrado, `'2'`=valor do registro, `'3'`=rateio pelo menor valor |
| `tipo_valor_informado` | [31,31] | alfa | 1 | 0 | true | null | `'1'`=percentual, `'2'`=valor |
| `filler_1` | [32,43] | alfa | 12 | 0 | false | null | Brancos |

## Blocos de beneficiário (3 blocos repetidos de 117 bytes, a partir da posição 44)

Cada bloco `N` (1º, 2º, 3º beneficiário) tem 9 campos: banco de crédito (fixo `237`), agência + dígito, conta + dígito, valor/percentual de rateio, nome, filler, parcela e floating (dias para crédito).

| Bloco | `codigo_banco_N` | `agencia_N` | `dac_agencia_N` | `conta_N` | `dac_conta_N` | `valor_percentual_N` | `nome_N` | `filler_N` | `parcela_N` | `floating_N` |
| -- | -- | -- | -- | -- | -- | -- | -- | -- | -- | -- |
| 1º | [44,46] | [47,51] | [52,52] | [53,64] | [65,65] | [66,80] | [81,120] | [121,151] | [152,157] | [158,160] |
| 2º | [161,163] | [164,168] | [169,169] | [170,181] | [182,182] | [183,197] | [198,237] | [238,268] | [269,274] | [275,277] |
| 3º | [278,280] | [281,285] | [286,286] | [287,298] | [299,299] | [300,314] | [315,354] | [355,385] | [386,391] | [392,394] |

- `codigo_banco_N`: num, 3, obrigatório `true`, padrão `'237'` — fixo, só existe rateio para contas do próprio Bradesco.
- `agencia_N`: num, 5, obrigatório `false`, padrão `null` — código da agência do beneficiário.
- `dac_agencia_N`: alfa, 1, obrigatório `false`, padrão `null` — dígito da agência.
- `conta_N`: num, 12, obrigatório `false`, padrão `null` — número da conta corrente do beneficiário.
- `dac_conta_N`: alfa, 1, obrigatório `false`, padrão `null` — dígito da conta corrente.
- `valor_percentual_N`: num, 13, decimais 2, obrigatório `false`, padrão `null` — valor ou percentual de rateio, conforme `tipo_valor_informado`.
- `nome_N`: alfa, 40, obrigatório `false`, padrão `null` — nome do beneficiário.
- `filler_N`: alfa, 31, obrigatório `false`, padrão `null` — brancos.
- `parcela_N`: alfa, 6, obrigatório `false`, padrão `null` — identificação da parcela (Obs. p.23).
- `floating_N`: num, 3, obrigatório `false`, padrão `null` — quantidade de dias para crédito do beneficiário.

## Campo final

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

## Nenhuma evidência real disponível

O fixture do projeto (`tests/fixtures/cnab400/bradesco/remessa-multipla.txt`) **não contém** nenhum registro tipo 3 — só tipos 0, 1, 2 e 9. As posições acima vêm só do manual oficial, sem confirmação cruzada com um arquivo de produção; `brcobranca` e `laravel-boleto` não implementam este registro (só o Bradesco.rb de remessa cobre tipo 1 e tipo 2/descontos).
