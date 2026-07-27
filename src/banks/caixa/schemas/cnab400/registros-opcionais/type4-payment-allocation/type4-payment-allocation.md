# Registro Tipo 4 — Tipo de Pagamento e Rateio de Crédito (Remessa, opcional)

> Fonte: manual oficial Caixa, `caixa_layout_CNAB_400_2024.pdf` (2024). Posições extraídas via `pdftotext -raw` e conferidas por soma (400 bytes exatos, sem gap/sobreposição, após correção de um off-by-one do próprio PDF — ver nota² abaixo). Sem confirmação de terceiros — `laravel-boleto` não implementa este registro.

## O que é

O mais complexo dos três registros opcionais da Caixa: combina duas finalidades num único registro:

1. **Definição de regras de pagamento com valor flexível** (posições 57-139) — permite configurar se o título aceita pagamento em valor diferente do nominal, dentro de uma faixa mínima/máxima (expressa em valor monetário ou percentual). Conceitualmente parecido com o registro PIX do Santander (`tipo8-pix.md`), mas **sem chave DICT nem QR Code** — aqui é só sobre a faixa de valores aceitos, o mecanismo de pagamento em si não está neste registro.
2. **Rateio de crédito entre beneficiários** (posições 183-289) — embutido no mesmo registro, diferente do padrão dos outros bancos do projeto (que usam um registro totalmente separado só para rateio, ex: `tipo3-rateio-credito.md` do Bradesco).

## Regras importantes

- `codigo_registro_opcional` (posição 57-58) tem sua própria Nota Explicativa (NE042) que sugere que esse campo pode distinguir sub-variantes deste registro — não totalmente esclarecido nesta extração.
- Os campos de valor/percentual máximo e mínimo (posições 79-139) só fazem sentido quando o beneficiário aceita pagamento em valor divergente do nominal — análogo à lógica do `tipo_pagamento='02'` do PIX Santander.
- **Duas incertezas registradas, não resolvidas por adivinhação**:
  1. `codigo_calculo_rateio` (posição 183) e `tipo_valor_informado_rateio` (posição 184): o manual mostra os códigos 2 e 3 como `"0 0 (000)"` em vez de dígitos únicos — provável artefato de célula vazia na extração do PDF, não confirmado. Os valores prováveis (por analogia com o registro de rateio de outros bancos) são `'1'`/`'2'`/`'3'` para cálculo e `'1'`/`'2'` para tipo de valor, mas isso **não está confirmado** pelo manual nesta extração.
  2. `nome_beneficiario` (posição 223-262) aparece no manual com picture `9(040)` (numérico) — quase certamente erro do PDF, já que é um campo de nome; tratado aqui como `alfa` por analogia com o campo equivalente em todos os outros bancos.
- Campo final `uso_exclusivo_4`: o manual mostra a faixa `289 a 394`, que sobrepõe 1 byte com o campo anterior (`motivo_ocorrido`, que termina em 289). Corrigido aqui para `290 a 394` (105 bytes) — essa é a faixa que fecha a soma total do registro em exatos 400 bytes.

## Campos

| Campo | Posição | Tipo | Tamanho | Obrigatório | Descrição |
| -- | -- | -- | -- | -- | -- |
| `codigo_registro` | [1,1] | num | 1 | true | `'4'` (inferido do contexto — mesma ressalva dos registros tipo 2/3) |
| `tipo_inscricao_empresa` | [2,3] | num | 2 | false | `'1'`=CPF, `'2'`=CNPJ |
| `numero_inscricao_empresa` | [4,17] | num | 14 | false | CPF/CNPJ do beneficiário |
| `codigo_agencia` | [18,21] | num | 4 | false | Código da agência de vinculação do beneficiário |
| `codigo_beneficiario` | [22,28] | num | 7 | false | Identificação da empresa na CAIXA |
| `uso_exclusivo_1` | [29,31] | alfa | 3 | false | Uso exclusivo CAIXA |
| `brancos_1` | [32,56] | alfa | 25 | false | Em branco |
| `codigo_registro_opcional` | [57,58] | num | 2 | false | Identificação do registro opcional (NE042, não totalmente esclarecido) |
| `tipo_pagamento` | [59,60] | num | 2 | false | Identificação do tipo de pagamento (NE043) |
| `quantidade_pagamentos_possiveis` | [61,62] | num | 2 | false | Quantidade de pagamentos possíveis (NE044) |
| `valor_nominal_titulo` | [63,77] | num | 15 | false | Alteração do valor nominal do título |
| `tipo_valor_maximo` | [78,78] | num | 1 | false | Tipo de valor informado — valor ou percentual (NE045) |
| `valor_maximo` | [79,93] | num | 15 | false | Valor máximo aceito |
| `percentual_maximo` | [94,108] | num | 15 | false | Percentual máximo aceito |
| `tipo_valor_minimo` | [109,109] | num | 1 | false | Tipo de valor informado — valor ou percentual (NE045) |
| `valor_minimo` | [110,124] | num | 15 | false | Valor mínimo aceito |
| `percentual_minimo` | [125,139] | num | 15 | false | Percentual mínimo aceito |
| `uso_exclusivo_2` | [140,142] | alfa | 3 | false | Uso exclusivo CAIXA |
| `agencia_credito_beneficiario` | [143,147] | num | 5 | false | Agência mantenedora da conta de crédito do beneficiário (NE048) |
| `dv_agencia_credito` | [148,148] | alfa | 1 | false | Dígito verificador da agência (NE049) |
| `conta_credito_beneficiario` | [149,160] | num | 12 | false | Conta corrente de crédito do beneficiário (NE050) |
| `dv_conta_credito` | [161,161] | alfa | 1 | false | Dígito verificador da conta (NE051) |
| `dv_agencia_conta` | [162,162] | alfa | 1 | false | Dígito verificador da agência/conta combinada (NE052) |
| `nosso_numero_modalidade` | [163,164] | num | 2 | false | `'11'`=emissão CAIXA, `'14'`=emissão beneficiário (NE015) |
| `nosso_numero` | [165,179] | num | 15 | false | Identificação do título na CAIXA (NE015) |
| `uso_exclusivo_3` | [180,182] | alfa | 3 | false | Uso exclusivo CAIXA |
| `codigo_calculo_rateio` | [183,183] | num | 1 | false | Ver nota de incerteza acima — provavelmente `'1'`=valor cobrado, `'2'`=valor do registro, `'3'`=rateio pelo menor valor |
| `tipo_valor_informado_rateio` | [184,184] | num | 1 | false | Ver nota de incerteza acima — provavelmente `'1'`=percentual, `'2'`=valor/quantidade |
| `valor_ou_percentual_rateio` | [185,199] | num | 15 | false | Valor/percentual do título ou quantidade de moedas para rateio (NE053) |
| `codigo_banco_credito` | [200,202] | num | 3 | false | Banco para crédito do beneficiário do rateio |
| `agencia_credito` | [203,207] | num | 5 | false | Agência para crédito do beneficiário do rateio (NE048) |
| `dv_agencia_credito_2` | [208,208] | num | 1 | false | Dígito verificador da agência (NE049) |
| `conta_credito` | [209,220] | num | 12 | false | Conta corrente para crédito do beneficiário do rateio (NE050) |
| `dv_conta_credito_2` | [221,221] | num | 1 | false | Dígito verificador da conta (NE051) |
| `dv_agencia_conta_2` | [222,222] | num | 1 | false | Dígito verificador da agência/conta combinada (NE052) |
| `nome_beneficiario` | [223,262] | alfa | 40 | false | Nome do beneficiário do rateio (ver nota sobre picture numérico no manual) |
| `parcela` | [263,268] | num | 6 | false | Identificação da parcela do rateio |
| `floating` | [269,271] | num | 3 | false | Quantidade de dias para crédito do beneficiário |
| `data_credito` | [272,279] | num | 8 | false | Data de crédito do beneficiário do rateio |
| `motivo_ocorrido` | [280,289] | num | 10 | false | Identificação das rejeições (NE054) |
| `uso_exclusivo_4` | [290,394] | alfa | 105 | false | Uso exclusivo CAIXA — ver nota² sobre a correção de posição |
| `numero_sequencial` | [395,400] | num | 6 | true | Número sequencial do registro no arquivo |

Total: 400 posições, conferido (soma exata após a correção de posição documentada acima).

## Nenhuma evidência real disponível

Não há fixture real ou sintética de CNAB 400 Caixa no projeto, e `laravel-boleto` não implementa este registro. Todas as posições vêm exclusivamente do manual oficial de 2024, com duas incertezas registradas explicitamente (não resolvidas por adivinhação) — vale confirmar contra um arquivo real ou uma segunda fonte antes de codificar em produção.
