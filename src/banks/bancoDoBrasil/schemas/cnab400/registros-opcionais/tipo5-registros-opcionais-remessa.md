# Registro Tipo 5 (variantes por `tipo_servico`) — Registros Opcionais de Remessa (Banco do Brasil, CNAB 400)

> Fonte: manual oficial BB remessa, `Doc2627CBR641Pos7.pdf` (abril/2012), p.7-8. Posições extraídas do PDF e conferidas contra `brcobranca` (`remessa/cnab400/banco_brasil.rb:154-161`) e `laravel-boleto` (`Cnab/Remessa/Cnab400/Banco/Bb.php:340-347`) onde essas libs implementam o registro. Detalhamento original em [`registros-opcionais-cnab400-bancodobrasil.md`](../../../../../../docs/comparativos/bancodobrasil/registros-opcionais-cnab400-bancodobrasil.md), seções 4-6.
>
> **Atualização — manual 2024** (`banco_do_brasil_2024_cnab400.pdf`, versão Junho/2024, convênios acima de 1.000.000): revelou duas variantes adicionais (`'07'` e `'08'`) que não constavam no manual de 2012 nem em nenhuma das bibliotecas de terceiros consultadas. Posições dessas duas extraídas diretamente do texto do PDF 2024 — a extração desse documento tem colunas de descrição/nota deslocadas em relação à coluna de posição (artefato comum de `pdftotext` em tabelas com células multi-linha), então as posições abaixo foram reconstruídas usando a coluna de posição (mais confiável) como referência; a coluna de descrição foi realinhada por lógica de conteúdo.

## O que é

O BB permite, além do detalhe obrigatório tipo 7, um registro opcional inteiro **tipo `'5'`** cujo conteúdo varia conforme o campo `tipo_servico` nas posições [2,3]. Cinco variantes existem do lado da **remessa** (retorno não é coberto aqui — ver seção 8 do comparativo geral se necessário):

| `tipo_servico` | Conteúdo | Arquivo (seção abaixo) | Fonte |
| -- | -- | -- | -- |
| `'99'` | Multa (+ prazo limite de recebimento) | Seção "Serviço 99 — Multa" | manual 2012 + 2024, `brcobranca`, `laravel-boleto` |
| `'01'` | E-mail do sacado | Seção "Serviço 01 — E-mail do sacado" | manual 2012 |
| `'03'` | "Seu número" do cedente com 15 posições | Seção "Serviço 03 — Seu número, 15 posições" | manual 2012 |
| `'07'` | 2º e 3º Descontos | Seção "Serviço 07 — 2º e 3º Descontos" | manual 2024 (novo) |
| `'08'` | Agente Negativador | Seção "Serviço 08 — Agente Negativador" | manual 2024 (novo) |

Todas compartilham: `tipo_registro` fixo `'5'` na posição [1,1], `tipo_servico` na posição [2,3]. Quando enviado, o registro deve vir na sequência do detalhe tipo 7 ao qual se refere.

## Nenhuma evidência real disponível

Não há fixture real do BB com nenhuma dessas variantes tipo 5 no projeto (a fixture real existente, `tests/fixtures/cnab400/bancoDoBrasil/BANCOBRASIL_cnab_400.REM`, só tem registros tipo 7 e tipo 5/`'99'`). Só a variante de multa (`'99'`) tem confirmação cruzada de duas bibliotecas de terceiros (`brcobranca` e `laravel-boleto`); as variantes de e-mail (`'01'`), seu-número (`'03'`), 2º/3º descontos (`'07'`) e agente negativador (`'08'`) só têm o manual oficial como fonte — as duas últimas só existem no manual 2024, então nem sequer têm o manual 2012 como segunda fonte.

---

## Serviço `'99'` — Multa

> Fonte: manual remessa, p.7 (notas 14-17, p.14-15).

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'5'` | Identificação do registro |
| `tipo_servico` | [2,3] | alfa | 2 | 0 | true | `'99'` | Cobrança de Multa |
| `codigo_multa` | [4,4] | num | 1 | 0 | true | null | `'1'`=Valor, `'2'`=Percentual, `'9'`=Dispensar cobrança de multa |
| `data_inicio_multa` | [5,10] | data (DDMMAA) | 6 | 0 | false | null | Data a partir da qual a multa é cobrada. Zeros se `codigo_multa='9'` |
| `valor_percentual_multa` | [11,22] | num | 12 | 2* | false | null | Valor (2 decimais) se `codigo_multa='1'`; percentual (5 inteiros + 2 decimais) se `codigo_multa='2'`; zeros se `'9'` |
| `brancos` | [23,394] | alfa | 372 | 0 | false | null | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

\* Decimais dependem de `codigo_multa` (valor monetário vs. percentual) — ver descrição.

Regra do manual (nota 14): só usar este registro quando o campo `comando`/`codigo_ocorrencia` (posição 109-110) do detalhe tipo 7 correspondente for `'01'` (Registro de Título), e ele deve vir **imediatamente após** o registro detalhe obrigatório ao qual se refere — mesmo padrão estrutural do tipo 2 (multa) do Itaú.

Único registro opcional do BB confirmado por biblioteca de terceiros: `brcobranca` e `laravel-boleto` implementam exatamente essas posições (`código[4,4]`, `data[5,10]`, `valor[11,22]` com 12 dígitos/2 decimais).

---

## Serviço `'01'` — E-mail do sacado

> Fonte: manual remessa, p.7 (nota 18, p.15).

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'5'` | Identificação do registro |
| `tipo_servico` | [2,3] | alfa | 2 | 0 | true | `'01'` | Envio de boleto por e-mail |
| `email_sacado` | [4,139] | alfa | 136 | 0 | false | null | Endereço de e-mail do sacado, deve conter `'@'` |
| `brancos` | [140,394] | alfa | 255 | 0 | false | null | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

Regras de negócio do manual (bloco de observações a-f, p.7):
- Só é validado se o cliente estiver previamente autorizado no sistema de cobrança do BB.
- Pode ser informado mais de um e-mail para o mesmo título, dentro do limite do campo (136 bytes).
- Só vale para as modalidades em que o próprio BB imprime e expede o boleto — não vale para Desconto ou Vendor.
- Não é enviado se o sacado for cliente BB com "Boleto Eletrônico" habilitado.
- Após liquidação/baixa do título, o boleto deixa de ficar disponível para acesso pelo sacado.

Sem confirmação cruzada de biblioteca de terceiros — só o manual oficial documenta esta variante.

---

## Serviço `'03'` — Seu número do cedente com 15 posições

> Fonte: manual remessa, p.8 (nota 36, p.19). O manual rotula esse registro incorretamente como "REGISTRO TRAILLER" no cabeçalho da tabela — é um erro de copy-paste do próprio PDF (o `tipo_registro` do campo 01.5 é `'5'`, igual aos outros dois registros desta família; não é o trailer de arquivo).

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'5'` | Identificação do registro |
| `tipo_servico` | [2,3] | num | 2 | 0 | true | `'03'` | Seu número, 15 posições |
| `identificacao_titulo_cedente` | [4,18] | alfa | 15 | 0 | false | null | "Seu número" do cedente, quando excede as 10 posições do campo padrão (111-120 do detalhe tipo 7) |
| `brancos` | [19,394] | alfa | 376 | 0 | false | null | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

Nota 36 do manual: o valor deste campo **prevalece** sobre o campo "Seu Número" (posição 111-120) do registro detalhe tipo 7 quando os dois estiverem presentes — mesmo padrão de precedência já visto no Itaú, onde tipo 5 sobrepõe dados equivalentes do tipo 1 (sacador/avalista).

Sem confirmação cruzada de biblioteca de terceiros — só o manual oficial documenta esta variante.

---

## Serviço `'07'` — 2º e 3º Descontos

> Fonte: manual 2024, p.8 (nota 39). Registro novo, não presente no manual de 2012 nem em nenhuma biblioteca de terceiros.

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'5'` | Identificação do registro |
| `tipo_servico` | [2,3] | alfa | 2 | 0 | true | `'07'` | Descontos |
| `data_limite_2_desconto` | [4,9] | data (DDMMAA) | 6 | 0 | false | null | Data limite para concessão do 2º desconto. Não pode ser posterior à data de vencimento do título nem à data do desconto anterior |
| `valor_2_desconto` | [10,26] | num | 17 | 2 | false | null | Valor do 2º desconto, menor que o desconto anterior. Zeros se não houver desconto |
| `data_limite_3_desconto` | [27,32] | data (DDMMAA) | 6 | 0 | false | null | Data limite para concessão do 3º desconto. Mesma regra do 2º desconto |
| `valor_3_desconto` | [33,49] | num | 17 | 2 | false | null | Valor do 3º desconto, menor que o desconto anterior. Zeros se não houver desconto |
| `brancos` | [50,394] | alfa | 345 | 0 | false | null | Complemento do registro |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Número sequencial do registro no arquivo |

Total: 400 posições, conferido (1+2+6+17+6+17+345+6 = 400).

Regra do manual (nota 39): só válido quando os campos 174-192 do detalhe tipo 7 (data/valor do 1º desconto) já estiverem preenchidos; se o detalhe tiver `'777777'` nas posições 174-179 (desconto por dia de antecipação), o manual diz que 2º e 3º descontos **não são aceitos**.

Sem confirmação cruzada de biblioteca de terceiros — variante nova, só o manual 2024 documenta.

---

## Serviço `'08'` — Agente Negativador

> Fonte: manual 2024, p.8-9 (nota 40). Registro novo, não presente no manual de 2012 nem em nenhuma biblioteca de terceiros.

| Campo | Posição | Tipo | Tamanho | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | true | `'5'` | Identificação do registro |
| `tipo_servico` | [2,3] | num | 2 | true | `'08'` | Negativação |
| `codigo_agente_negativador` | [4,5] | num | 2 | true | null | `'10'`=Serasa, `'11'`=Quod |
| `brancos` | [6,400] | alfa | 395 | false | null | Complemento do registro |

Total: 400 posições (1+2+2+395 = 400), mas **atenção**: diferente de todas as outras 4 variantes tipo 5 (que terminam com `numero_sequencial` explícito em [395,400]), a tabela extraída do manual 2024 para este registro não mostra esse campo separado — só um bloco único de brancos até 400. Isso pode ser:
- o layout real desse registro específico (sem sequencial próprio), ou
- um artefato da extração do PDF (célula de tabela cortada/mesclada, mesmo tipo de problema já visto em outras tabelas deste mesmo manual).

Usado junto com `comando`/`codigo_ocorrencia` = `'01'` (registro de título) + `instrução codificada` = `'88'` no detalhe tipo 7 correspondente (nota 40), ou com os comandos `'85'`/`'86'` (inclusão/exclusão de negativação sem protesto).

**Recomendação**: conferir a página 8-9 do PDF original (`banco_do_brasil_2024_cnab400.pdf`) visualmente antes de implementar este registro no schema, para confirmar se `numero_sequencial` existe em [395,400] (mais provável, por consistência com as outras variantes) ou se o registro realmente é só brancos após a posição 5.

Sem confirmação cruzada de biblioteca de terceiros — variante nova, só o manual 2024 documenta.

---

## Header e Trailer

O manual não mostra variação de header/trailer para esta família — usa os mesmos já implementados em `../../header.ts` e `../../trailer.ts`, igual ao padrão do detalhe tipo 7.

## Retorno — fora do escopo deste documento

O BB também tem registros tipo 5 do lado do retorno (`'01'` bloqueto por e-mail, `'04'` dados de cheque, `'06'` seu número 15 posições) mais um registro tipo 2 (partilha carteira 17) e um tipo 3 (Vendor). Esses já estão catalogados no documento comparativo principal ([`registros-opcionais-cnab400-bancodobrasil.md`](../../../../../../docs/comparativos/bancodobrasil/registros-opcionais-cnab400-bancodobrasil.md)) e não são replicados aqui por não serem de interesse no momento.
