# Registro Tipo 2 — Complemento de Multa (Remessa, opcional)

> Fonte: manual oficial Itaú, `layout_cobranca_400bytes_cnab_itau.pdf`, p.9 (fevereiro/2016). Posições extraídas diretamente do PDF (`pdftotext`), não de terceiros.

## O que é

Registro inteiro separado (não é um campo dentro do detalhe tipo 1) que o cedente pode enviar **logo após** cada registro de detalhe tipo 1 para registrar ou alterar valores/percentuais de multa daquele título. Confirmado no fixture real do projeto (`tests/fixtures/cnab400/itau/ITAU_cnab_400.REM`): 319 detalhes tipo 1, cada um seguido de um registro tipo 2, pareados 1:1 — ver `campos-a-adicionar-cnab400-itau.md`.

## Regras importantes (manual)

- Opcional. Só precisa ser enviado quando o beneficiário quiser registrar/alterar multa. Válido só para carteiras **com registro**; pode ser usado a qualquer momento, sem cadastro prévio junto ao Itaú.
- Quando enviado, deve seguir a sequência lógica de registro de cobrança (isto é, logo após o tipo 1 ao qual se refere).
- **Não retorna no arquivo de retorno.** Qualquer erro no registro tipo 2 é reportado no retorno do registro tipo 1 correspondente.
- Não pode haver mais de um registro tipo 2 por boleto — se isso ocorrer, o tipo 1 volta com erro "Registro Inválido".

## Campos

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'2'` | Identificação do registro (complemento de multa) |
| `cod_multa` | [2,2] | alfa | 1 | 0 | false | null | Código da multa (ver NOTA 35 do manual) |
| `data_multa` | [3,10] | data (**DDMMAAAA**, 8 dígitos) | 8 | 0 | false | null | Data da multa. Confirmado no fixture: sempre igual ao `vencimento` do detalhe tipo 1 correspondente (ex: `"06072026"` ↔ `"060726"`) |
| `multa` | [11,23] | num | 13 | 2* | false | null | Valor ou percentual de multa a aplicar (NOTA 35 define qual dos dois) |
| `brancos` | [24,394] | alfa | 371** | 0 | false | null | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

\* O manual só documenta a *picture* `9(013)` sem casas decimais explícitas para este campo — usei 2 decimais por analogia com os demais campos monetários do layout (a única exceção conhecida é `qtde_moeda` do detalhe tipo 1, que usa 5). Vale confirmar contra um valor real de multa no fixture antes de implementar.

\** O manual imprime a faixa como `024 394` com *picture* `X(370)`, mas `394 - 24 + 1 = 371`. É uma inconsistência do próprio PDF (aritmética não fecha) — a faixa de posições é a fonte mais confiável; o tamanho seria `371`, não `370`. Vale re-conferir contra bytes reais do fixture ao implementar.

## Diferença importante de formato

`data_multa` usa **DDMMAAAA (8 dígitos)** — diferente de todos os outros campos de data do layout Itaú (que usam DDMMAA, 6 dígitos). Fácil de errar por hábito.

## Notas do manual referenciadas

- NOTA 35: regras de código/data/valor da multa — texto completo não extraído (não crítico para a posição/tamanho dos campos, mas relevante para regras de negócio como formato de percentual vs. valor).
