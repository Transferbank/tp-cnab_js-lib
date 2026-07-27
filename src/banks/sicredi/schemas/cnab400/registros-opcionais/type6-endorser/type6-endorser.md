# Registro Tipo 6 — Beneficiário Final (Remessa, opcional condicional)

> Fonte: manual oficial Sicredi, `2026_03_12_manual_cnab_400_30.pdf` (v3.0, fev/2026), §8.5, p.33. Sem confirmação de terceiros — nenhuma lib do projeto implementa este registro dedicado (o `laravel-boleto` só grava documento+nome do "sacador/avalista" resumido dentro do próprio detalhe, posições 340-394 — ver `detail.ts`).

## O que é

Registro que carrega os dados completos (incluindo endereço) do **Beneficiário Final** de um título — conceito que substituiu "Sacador"/"Avalista" por força das Circulares BACEN 3598, 3656 e 3956, citadas explicitamente pelo manual. Diferente do bloco resumido de Beneficiário Final que já existe dentro do detalhe (posições 340-394, só documento+nome), este registro tem campos de endereço próprios (logradouro, cidade, CEP, UF) — sugere uso quando o Beneficiário Final precisa de endereço de correspondência próprio, distinto do pagador.

## Regras importantes (manual)

- **"Obrigatório apenas quando houver um beneficiário final para o título cadastrado"** — ou seja, opcional condicional: se o título tem beneficiário final, este registro deve ser enviado.
- O registro de cadastro do título (tipo 1) deve vir **antes** do registro beneficiário final correspondente.
- Contém 1 linha por título.

## Campos

| Campo | Posição | Tipo | Tamanho | Obrigatório | Descrição |
| -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | true | `'6'` |
| `nosso_numero` | [2,16] | alfa | 15 | false | Pode ficar em branco se impressão pelo Sicredi (gerado automaticamente) |
| `numero_documento` | [17,26] | alfa | 10 | false | "Seu número" — deve bater com posições 111-120 do detalhe |
| `codigo_pagador_cliente` | [27,31] | alfa | 5 | false | Código do pagador junto ao cliente, zeros se não houver |
| `numero_inscricao_beneficiario_final` | [32,45] | num | 14 | true | CPF/CNPJ do Beneficiário Final — deve ser diferente do beneficiário e do pagador |
| `nome_beneficiario_final` | [46,86] | alfa | 41 | true | Preenchimento obrigatório |
| `endereco` | [87,131] | alfa | 45 | true | Preenchimento obrigatório |
| `cidade` | [132,151] | alfa | 20 | false | — |
| `cep` | [152,159] | num | 8 | false | CEP válido |
| `uf` | [160,161] | alfa | 2 | true | Preenchimento obrigatório |
| `brancos` | [162,394] | alfa | 233 | false | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | true | Sequencial do registro no arquivo |

## Nenhuma evidência de biblioteca de terceiros

Nem `laravel-boleto` nem `brcobranca` implementam este registro dedicado — só o manual oficial documenta.
