# Registro Tipo 7 — Descontos 2 e 3 (Remessa, opcional)

> Fonte: manual oficial Sicredi, `2026_03_12_manual_cnab_400_30.pdf` (v3.0, fev/2026), §8.6, p.34. Sem confirmação de terceiros — nenhuma lib do projeto implementa este registro.

## O que é

Registro que permite cadastrar um **2º e 3º nível de desconto** (data limite + valor/percentual cada) para o mesmo título, além do desconto 1 já cadastrado no detalhe (tipo 1, posições 180-192).

## Regras importantes (manual)

- **"Esse registro só deve ser gerado quando o desconto 1 já foi informado no registro de cadastro de título"** — depende do desconto 1 existir primeiro.
- **Mutuamente excludente com desconto por dia de antecipação**: "no caso de envio dos descontos 1, 2 ou 3 o desconto por dia de antecipação não será considerado" (o campo de antecipação é o do detalhe, posições 83-92).
- O registro de cadastro do título (tipo 1) deve vir **antes** deste registro.

## Campos

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Descrição |
| -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'7'` |
| `nosso_numero` | [2,16] | alfa | 15 | 0 | false | Pode ficar em branco se impressão pelo Sicredi |
| `numero_documento` | [17,26] | alfa | 10 | 0 | false | "Seu número" — deve bater com posições 111-120 do detalhe |
| `numero_inscricao_pagador` | [27,40] | num | 14 | 0 | true | CPF/CNPJ do pagador, dado real mesmo em homologação |
| `numero_inscricao_beneficiario_final` | [41,54] | num | 14 | 0 | false | CPF/CNPJ do Beneficiário Final — vazio se não existir |
| `data_limite_desconto_2` | [55,60] | data (DDMMAA) | 6 | 0 | true | Data limite para o 2º desconto |
| `valor_desconto_2` | [61,73] | num | 13 | 2 | true | Valor ou percentual do 2º desconto |
| `data_limite_desconto_3` | [74,79] | data (DDMMAA) | 6 | 0 | false | Data limite para o 3º desconto |
| `valor_desconto_3` | [80,92] | num | 13 | 2 | false | Valor ou percentual do 3º desconto |
| `brancos` | [93,394] | alfa | 302 | 0 | false | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | Sequencial do registro no arquivo |

## Nenhuma evidência de biblioteca de terceiros

Nem `laravel-boleto` nem `brcobranca` implementam este registro — só o manual oficial documenta.
