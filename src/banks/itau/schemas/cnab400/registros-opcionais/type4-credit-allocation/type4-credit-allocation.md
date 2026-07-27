# Registro Tipo 4 — Rateio de Crédito (Remessa, opcional)

> Fonte: manual oficial Itaú, `layout_cobranca_400bytes_cnab_itau.pdf`, p.10-11 (fevereiro/2016). Posições extraídas diretamente do PDF (`pdftotext`, sem `-layout` para preservar a ordem real das colunas nome/posição/picture/conteúdo — a extração com `-layout` embaralha essas 4 colunas nesta tabela específica).

## O que é

Registro inteiro separado, opcional, para indicar que o crédito do título deve ser **rateado entre até 14 contas de crédito** (agência+conta+dac+valor, blocos de 25 bytes repetidos). Para cada registro de detalhe obrigatório (tipo 1) podem ser usados **até 3 registros tipo 4** — ou seja, até 42 contas de rateio por título no total (3 registros × 14 blocos), embora o manual também mencione um limite de 30 contas por título.

## Regras importantes (manual)

- O arquivo pode misturar títulos de cobrança normal e títulos com rateio de crédito.
- Instruções de protesto seguem o mesmo procedimento com ou sem rateio.
- O rateio pode ser **por percentual ou por valor** (ver NOTA 32 e o campo `tipo_valor`).
- Se a Agência/Conta/DAC do beneficiário e o Nº da Carteira/Nosso Número informados no(s) registro(s) tipo 4 não coincidirem com os do respectivo tipo 1, a entrada do título é aceita **sem** rateio (os registros tipo 4 são desprezados).
- O título é rejeitado se a soma dos valores/percentuais de rateio ultrapassar o valor nominal do título.
- Se os registros tipo 4 não tiverem nenhuma agência/conta de crédito preenchida, são desprezados e o título vira cobrança normal.
- A agência/conta do beneficiário e sua agência/conta centralizadora de crédito não podem estar entre as contas beneficiárias do rateio.
- Boletos com rateio de crédito **não aceitam** instruções de desconto ou abatimento, e não permitem alteração dos valores nominal/de crédito.
- Não há incidência de CPMF quando a raiz do CNPJ da conta do beneficiário é igual à da conta de crédito do rateio (nota histórica do manual, tributo extinto).

## Campos fixos (posições 1-43)

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'4'` | Identificação do registro (rateio de crédito) |
| `codigo_inscricao` | [2,3] | num | 2 | 0 | false | null | Tipo de inscrição da empresa/beneficiário (NOTA 1) |
| `numero_inscricao` | [4,17] | num | 14 | 0 | false | null | CPF/CNPJ da empresa (NOTA 1) |
| `agencia` | [18,21] | num | 4 | 0 | false | null | Agência mantenedora da conta |
| `zeros` | [22,23] | num | 2 | 0 | false | `'00'` | Complemento de registro |
| `conta` | [24,28] | num | 5 | 0 | false | null | Número da conta corrente da empresa |
| `dac` | [29,29] | num | 1 | 0 | false | null | Dígito de auto conferência agência/conta empresa |
| `numero_carteira` | [30,32] | num | 3 | 0 | false | null | Número da carteira no banco |
| `nosso_numero` | [33,40] | num | 8 | 0 | false | null | Identificação do título no banco |
| `dac_nosso_numero` | [41,41] | num | 1 | 0 | false | null | DAC do nosso número |
| `sequencia_registro` | [42,43] | num | 2 | 0 | false | null | Número sequencial dos registros tipo 4 do título (1 a 3 — qual dos até 3 registros tipo 4 este é) |

## Blocos de rateio (14 blocos repetidos de 25 bytes, a partir da posição 44)

Cada bloco `N` (1 a 14) tem 4 campos: agência de crédito (4), conta de crédito (7), DAC (1) e valor de crédito (13, `9(11)V9(2)` — NOTA 32 define se é valor ou percentual).

| Bloco | `agencia_credito_N` | `conta_credito_N` | `dac_credito_N` | `valor_credito_N` |
| -- | -- | -- | -- | -- |
| 01 | [44,47] | [48,54] | [55,55] | [56,68] |
| 02 | [69,72] | [73,79] | [80,80] | [81,93] |
| 03 | [94,97] | [98,104] | [105,105] | [106,118] |
| 04 | [119,122] | [123,129] | [130,130] | [131,143] |
| 05 | [144,147] | [148,154] | [155,155] | [156,168] |
| 06 | [169,172] | [173,179] | [180,180] | [181,193] |
| 07 | [194,197] | [198,204] | [205,205] | [206,218] |
| 08 | [219,222] | [223,229] | [230,230] | [231,243] |
| 09 | [244,247] | [248,254] | [255,255] | [256,268] |
| 10 | [269,272] | [273,279] | [280,280] | [281,293] |
| 11 | [294,297] | [298,304] | [305,305] | [306,318] |
| 12 | [319,322] | [323,329] | [330,330] | [331,343] |
| 13 | [344,347] | [348,354] | [355,355] | [356,368] |
| 14 | [369,372] | [373,379] | [380,380] | [381,393] |

Todos os campos `agencia_credito_N`/`conta_credito_N`/`dac_credito_N` são `num`, tamanhos 4/7/1, decimais 0. Todos os `valor_credito_N` são `num`, tamanho 13, decimais 2, obrigatório `false`, padrão `null`.

## Campos finais

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_valor` | [394,394] | num | 1 | 0 | false | null | Indica se o rateio é por valor ou percentual (NOTA 32) |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

## Nenhuma evidência real disponível

Diferente do tipo 2 (multa), o fixture real do projeto (`ITAU_cnab_400.REM`) **não contém** nenhum registro tipo 4 — só tem tipos 0, 1, 2 e 9. As posições acima vêm só do manual oficial; não há confirmação cruzada com um arquivo de produção.
