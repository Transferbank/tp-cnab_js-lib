# Registro Tipo 2 — Mensagens do Título (Remessa, opcional)

> Fonte: manual oficial Caixa, `caixa_layout_CNAB_400_2024.pdf` (2024). Posições extraídas via `pdftotext -raw` e conferidas por soma (400 bytes exatos, sem gap/sobreposição). Sem confirmação de terceiros — `laravel-boleto` (única lib de referência do projeto para Caixa) não implementa este registro.

## O que é

Registro inteiro separado, opcional, que permite anexar **até 6 mensagens livres de 40 caracteres cada**, impressas no boleto do título correspondente. Repete os mesmos campos de identificação do registro detalhe (tipo 1) — tipo/número de inscrição da empresa, agência, código do beneficiário, nosso número, carteira, código de ocorrência e código do banco — antes das mensagens propriamente ditas, o que sugere que o registro é auto-suficiente para localizar o título sem depender só da ordem/adjacência com o detalhe.

## Regras importantes

- Deve se referir ao mesmo título do registro detalhe (tipo 1) correspondente — os campos de identificação (agência, código do beneficiário, nosso número) devem coincidir.
- O manual não deixa explícito neste trecho um limite de registros tipo 2 por título (diferente de alguns registros equivalentes em outros bancos, que limitam a 1 por título) — tratar como incerteza em aberto até confirmação.
- `codigo_registro` (posição 1) não teve o valor fixo `'2'` mostrado explicitamente na tabela extraída do PDF — inferido pelo contexto (nome da seção "Registro Tipo 2 — Mensagens do Título" e pela posição do registro na composição do arquivo). Vale confirmar contra um arquivo real antes de tratar como certeza absoluta.

## Campos

| Campo | Posição | Tipo | Tamanho | Obrigatório | Descrição |
| -- | -- | -- | -- | -- | -- |
| `codigo_registro` | [1,1] | num | 1 | true | `'2'` (inferido — ver nota acima) |
| `tipo_inscricao_empresa` | [2,3] | num | 2 | false | `'1'`=CPF, `'2'`=CNPJ |
| `numero_inscricao_empresa` | [4,17] | num | 14 | false | CPF/CNPJ do beneficiário |
| `codigo_agencia` | [18,21] | num | 4 | false | Código da agência de vinculação do beneficiário |
| `codigo_beneficiario` | [22,28] | num | 7 | false | Identificação da empresa na CAIXA |
| `uso_exclusivo_1` | [29,31] | alfa | 3 | false | Uso exclusivo CAIXA — preencher com espaços |
| `brancos_1` | [32,56] | alfa | 25 | false | Preencher com espaços |
| `nosso_numero_modalidade` | [57,58] | num | 2 | false | `'11'`=título registrado emissão CAIXA, `'14'`=título registrado emissão beneficiário |
| `nosso_numero` | [59,73] | num | 15 | false | Identificação do título na CAIXA — deve bater com o do registro detalhe correspondente |
| `brancos_2` | [74,106] | alfa | 33 | false | Campos em branco |
| `carteira` | [107,108] | num | 2 | false | Código da carteira |
| `codigo_ocorrencia` | [109,110] | num | 2 | false | Identificação do tipo de ocorrência do arquivo remessa |
| `uso_exclusivo_2` | [111,139] | alfa | 29 | false | Uso exclusivo CAIXA |
| `codigo_banco` | [140,142] | num | 3 | false | Código do banco na compensação (`'104'`) |
| `mensagem_1` | [143,182] | alfa | 40 | false | 1ª mensagem a ser impressa no boleto |
| `mensagem_2` | [183,222] | alfa | 40 | false | 2ª mensagem |
| `mensagem_3` | [223,262] | alfa | 40 | false | 3ª mensagem |
| `mensagem_4` | [263,302] | alfa | 40 | false | 4ª mensagem |
| `mensagem_5` | [303,342] | alfa | 40 | false | 5ª mensagem |
| `mensagem_6` | [343,382] | alfa | 40 | false | 6ª mensagem |
| `uso_exclusivo_3` | [383,394] | alfa | 12 | false | Uso exclusivo CAIXA — preencher com espaços |
| `numero_sequencial` | [395,400] | num | 6 | true | Número sequencial do registro no arquivo |

Total: 400 posições, conferido (soma exata, sem gap/sobreposição).

## Nenhuma evidência real disponível

Não há fixture real ou sintética de CNAB 400 Caixa no projeto, e `laravel-boleto` não implementa este registro. Todas as posições vêm exclusivamente do manual oficial de 2024.
