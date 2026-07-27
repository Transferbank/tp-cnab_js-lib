# Registro Tipo 6 (Layouts 1-4) — Emissão de Boleto pelo Cedente (Remessa, opcional)

> Fonte: manual oficial Itaú, `layout_cobranca_400bytes_cnab_itau.pdf`, §6, p.44-47 (fevereiro/2016). Posições extraídas diretamente do PDF (`pdftotext`).

## O que é

Família de registros **paralela e independente** ao fluxo tipo 1/2/4/5: serve para o cedente pedir ao Itaú que **emita fisicamente o boleto** (não é uma instrução de cobrança normal). Usa o **mesmo header e o mesmo trailer de arquivo** já implementados em `header.ts`/`trailer.ts` — só o corpo do arquivo muda, com até 4 "layouts" de detalhe identificados pelo campo `codigo_layout` (posição 2):

| Layout | Conteúdo | Arquivo |
| -- | -- | -- |
| 1 | Dados do título (equivalente ao detalhe tipo 1, mas com posições completamente diferentes) | `layout1-titulo.md` (seção abaixo) |
| 2 | Texto livre — linhas 1 a 5 da área "Instruções" do boleto | `layout2-instrucoes-1-5.md` (seção abaixo) |
| 3 | Texto livre — linhas 6 a 9 da área "Instruções" do boleto | `layout3-instrucoes-6-9.md` (seção abaixo) |
| 4 | Extensão de dados do sacador/avalista | `layout4-sacador-avalista.md` (seção abaixo) |

Todos os quatro compartilham: `tipo_registro` fixo `'6'` na posição [1,1], e `codigo_layout` na posição [2,2] com o valor `'1'`/`'2'`/`'3'`/`'4'` conforme a tabela acima.

## Nenhuma evidência real disponível

O fixture real do projeto (`ITAU_cnab_400.REM`) não contém nenhum registro tipo 6 — só tipos 0, 1, 2 e 9. Todas as posições abaixo vêm apenas do manual oficial.

---

## Layout 1 — Dados do Título

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'6'` | Identificação do registro |
| `codigo_layout` | [2,2] | num | 1 | 0 | true | `'1'` | Identificação do layout |
| `agencia` | [3,6] | num | 4 | 0 | true | null | Agência mantenedora da conta |
| `zeros` | [7,8] | num | 2 | 0 | false | `'00'` | Complemento de registro |
| `conta` | [9,13] | num | 5 | 0 | true | null | Número da conta corrente da empresa |
| `dac` | [14,14] | num | 1 | 0 | true | null | Dígito de auto conferência agência/conta empresa |
| `numero_carteira` | [15,17] | num | 3 | 0 | true | null | Número da carteira no banco |
| `nosso_numero` | [18,25] | num | 8 | 0 | true | null | Identificação do título no banco |
| `dac_nosso_numero` | [26,26] | num | 1 | 0 | true | null | DAC do nosso número |
| `codigo_moeda` | [27,27] | num | 1 | 0 | true | null | `0` = Real, `1` = Moeda variável — indica se o valor do título está em Real ou moeda variável |
| `literal_moeda` | [28,31] | alfa | 4 | 0 | false | null | Identificação da moeda a imprimir no boleto, para moeda variável (NOTA 23) |
| `valor_titulo` | [32,44] | num | 13 | 2* | true | null | Valor do título (NOTA 24) |
| `seu_numero` | [45,54] | alfa | 10 | 0 | false | null | Número do documento na empresa |
| `vencimento` | [55,60] | data (DDMMAA) | 6 | 0 | true | null | Data de vencimento do título |
| `especie` | [61,62] | alfa | 2 | 0 | true | null | Espécie do título (NOTA 10) |
| `aceite` | [63,63] | alfa | 1 | 0 | true | null | `A`=Sim, `N`=Não |
| `data_emissao` | [64,69] | data (DDMMAA) | 6 | 0 | true | null | Data de emissão do título |
| `codigo_inscricao` | [70,71] | num | 2 | 0 | true | null | `01`=CPF, `02`=CNPJ — tipo de inscrição do pagador |
| `numero_inscricao` | [72,86] | num | 15 | 0 | true | null | CPF/CNPJ do pagador |
| `nome` | [87,116] | alfa | 30 | 0 | true | null | Nome do pagador |
| `brancos_1` | [117,125] | alfa | 9 | 0 | false | null | Complemento de registro |
| `logradouro` | [126,165] | alfa | 40 | 0 | false | null | Rua, número e complemento do pagador |
| `bairro` | [166,177] | alfa | 12 | 0 | false | null | Bairro do pagador |
| `cep` | [178,185] | num | 8 | 0 | false | null | CEP do pagador |
| `cidade` | [186,200] | alfa | 15 | 0 | false | null | Cidade do pagador |
| `estado` | [201,202] | alfa | 2 | 0 | false | null | UF do pagador |
| `sacador_avalista` | [203,232] | alfa | 30 | 0 | false | null | Nome do sacador/avalista |
| `brancos_2` | [233,236] | alfa | 4 | 0 | false | null | Complemento de registro |
| `local_pagamento_1` | [237,291] | alfa | 55 | 0 | false | null | Local para pagamento do título — linha 1 |
| `local_pagamento_2` | [292,346] | alfa | 55 | 0 | false | null | Local para pagamento do título — linha 2 |
| `sacador_codigo_inscricao` | [347,348] | num | 2 | 0 | false | null | `01`=CPF, `02`=CNPJ — tipo de inscrição do sacador/avalista |
| `sacador_numero_inscricao` | [349,363] | num | 15 | 0 | false | null | CPF/CNPJ do sacador/avalista |
| `brancos_3` | [364,394] | alfa | 31 | 0 | false | null | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

\* Para títulos em moeda variável, o manual observa que o valor deve ser informado na *picture* `9(08)V9(05)` em vez de `9(11)V9(2)` — ou seja, o mesmo tamanho de campo (13) mas com 5 casas decimais em vez de 2, análogo ao caso de `qtde_moeda` no detalhe tipo 1. Vale tratar como campo condicional ao implementar.

---

## Layout 2 — Instruções (linhas 1 a 5)

Texto livre impresso na área "Instruções" do boleto.

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'6'` | Identificação do registro |
| `codigo_layout` | [2,2] | num | 1 | 0 | true | `'2'` | Identificação do layout |
| `linha_1` | [3,71] | alfa | 69 | 0 | false | null | Conteúdo da 1ª linha de impressão da área "Instruções" (NOTA 26) |
| `linha_2` | [72,140] | alfa | 69 | 0 | false | null | Conteúdo da 2ª linha (NOTA 26) |
| `linha_3` | [141,209] | alfa | 69 | 0 | false | null | Conteúdo da 3ª linha (NOTA 26) |
| `linha_4` | [210,278] | alfa | 69 | 0 | false | null | Conteúdo da 4ª linha (NOTA 26) |
| `linha_5` | [279,347] | alfa | 69 | 0 | false | null | Conteúdo da 5ª linha (NOTA 26) |
| `brancos` | [348,394] | alfa | 47 | 0 | false | null | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

---

## Layout 3 — Instruções (linhas 6 a 9)

Continuação do layout 2, mesmo propósito.

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'6'` | Identificação do registro |
| `codigo_layout` | [2,2] | num | 1 | 0 | true | `'3'` | Identificação do layout |
| `linha_6` | [3,71] | alfa | 69 | 0 | false | null | Conteúdo da 6ª linha de impressão da área "Instruções" (NOTA 26) |
| `linha_7` | [72,140] | alfa | 69 | 0 | false | null | Conteúdo da 7ª linha (NOTA 26) |
| `linha_8` | [141,209] | alfa | 69 | 0 | false | null | Conteúdo da 8ª linha (NOTA 26) |
| `linha_9` | [210,278] | alfa | 69 | 0 | false | null | Conteúdo da 9ª linha (NOTA 26) |
| `brancos` | [279,394] | alfa | 116 | 0 | false | null | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

---

## Layout 4 — Extensão de Dados do Sacador/Avalista

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'6'` | Identificação do registro |
| `codigo_layout` | [2,2] | num | 1 | 0 | true | `'4'` | Identificação do layout |
| `codigo_inscricao` | [3,4] | num | 2 | 0 | false | null | `01`=CPF, `02`=CNPJ — tipo de inscrição do sacador/avalista |
| `numero_inscricao` | [5,18] | num | 14 | 0 | false | null | CPF/CNPJ do sacador/avalista |
| `logradouro` | [19,58] | alfa | 40 | 0 | false | null | Rua, número e complemento do sacador/avalista |
| `bairro` | [59,70] | alfa | 12 | 0 | false | null | Bairro do sacador/avalista |
| `cep` | [71,78] | num | 8 | 0 | false | null | CEP do sacador/avalista |
| `cidade` | [79,93] | alfa | 15 | 0 | false | null | Cidade do sacador/avalista |
| `estado` | [94,95] | alfa | 2 | 0 | false | null | UF do sacador/avalista |
| `brancos` | [96,394] | alfa | 299 | 0 | false | null | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

---

## Header e Trailer da família tipo 6

O manual (p.44 e p.47) mostra o header e o trailer desta família como **byte a byte idênticos** ao header e trailer já implementados em `../header.ts` e `../trailer.ts` — não é preciso criar variantes novas, só reaproveitar o que já existe se algum dia esta família for implementada.
