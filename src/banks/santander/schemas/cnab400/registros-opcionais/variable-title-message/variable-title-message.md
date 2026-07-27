# Registros Tipo 2/4/5/6/7 — Mensagem Variável por Título (Remessa, opcional)

> Fonte primária (revisada): **manual oficial Santander jul/2025** (`Santander_Layout-Cobranca-400-posicoes-jul-2025-Portugues.pdf`, v2.36, extraído em `santander_2025_raw.txt`), seção "Registro Movimento - Remessa - mensagem variável p/ boleto (opcional)" (p.11).
>
> **Correção em relação à versão anterior deste documento**: a primeira versão foi baseada no manual de 2009 (`CNAB 400 COBRANÇA 2015.PDF`) e **errou a estrutura** — tratava as posições 100-382 como um único bloco de "uso do banco" (283 bytes), quando na verdade o manual 2025 mostra que ali existem **mais dois blocos completos de mensagem** (cada um com seu próprio marcador de subsequência), não apenas o de 50-99. Total de 3 blocos de mensagem, não 1. Reconferido nesta revisão diretamente contra o texto do manual 2025.

## O que é

O manual descreve a composição do arquivo-remessa do Santander como:

> `REGISTRO 0 = Header | REGISTRO 1 = Registro de Movimento | REGISTRO 8 = Tipo de Pagamento e Dados QR Code (Opcional) | REGISTRO 2 = Mensagem Variável por Boleto (Opcional) | REGISTRO 4 = Mensagem Variável por Boleto (Opcional) | REGISTRO 5 = Mensagem Variável por Boleto (Opcional) | REGISTRO 6 = Mensagem Variável por Boleto (Opcional) | REGISTRO 7 = Mensagem Variável por Boleto (Opcional) | REGISTRO 9 = Trailer`

Cinco códigos de registro diferentes (2, 4, 5, 6 e 7) compartilham exatamente o mesmo layout — mas **o manual 2025 esclarece a diferença semântica que o manual de 2009 não tinha**:

- **`'2'`** = mensagem no **Recibo do Pagador** — até 3 mensagens por linha, até 24 vezes; disponibilizada na emissão de 2ª via nos canais Santander (até 7 linhas no Recibo).
- **`'4'`, `'5'`, `'6'`, `'7'`** = mensagens na **Ficha de Compensação** — cada código enviado **somente 1 vez**; **não** disponibilizadas na emissão de 2ª via nos canais Santander (diferença prática real em relação ao `'2'`).

## Regras importantes (manual 2025)

- Aviso oficial (comunicado FEBRABAN citado no manual): **não é recomendado** utilizar as expressões "taxa bancária" ou "tarifa bancária" no texto da mensagem de cobrança.
- O registro tem **3 blocos de mensagem variável**, cada um precedido por um marcador de subsequência de 2 dígitos: bloco 1 (subsequência `'01'`, mensagem 50-99), bloco 2 (subsequência `'02'`, mensagem 102-151), bloco 3 (mensagem 154-203). Isso é uma revisão importante em relação à primeira versão deste documento, que só conhecia o bloco 1.
- **Inconsistência do próprio manual, não resolvida por adivinhação**: o marcador de subsequência do bloco 3 (posição 152-153) aparece no manual com conteúdo `'02'` — igual ao do bloco 2 — quando o esperado por analogia seria `'03'`. Pode ser erro de digitação do manual (mais provável) ou intencional. Não travar em nenhum valor fixo até confirmar.
- `codigo_agencia` (18-21), `conta_movimento` (22-29) e `conta_cobranca` (30-37) formam, juntos, os mesmos 20 bytes que em outros registros do Santander aparecem como um único campo `codigo_transmissao` (ver nota 2 do manual, mesma referência usada em `header.ts`/`detail.ts`) — aqui o manual 2025 mostra a subdivisão explicitamente, diferente de onde é tratado como bloco único.
- `identificador_complemento` (383) + `complemento` (384-385): mesmos campos que aparecem no detalhe (tipo 1) nas posições 383 e 384-385 — mesma nota 2 do manual.

## Campos (revisado conforme manual 2025 v2.36)

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `codigo_registro` | [1,1] | num | 1 | 0 | true | null | `'2'`=Recibo do pagador; `'4'`,`'5'`,`'6'`,`'7'`=Ficha de compensação |
| `reservado_1` | [2,17] | alfa | 16 | 0 | false | null | Reservado (uso Banco) |
| `codigo_agencia` | [18,21] | num | 4 | 0 | false | null | Código da agência do beneficiário |
| `conta_movimento` | [22,29] | num | 8 | 0 | false | null | Conta movimento do beneficiário |
| `conta_cobranca` | [30,37] | num | 8 | 0 | false | null | Conta cobrança do beneficiário |
| `reservado_2` | [38,47] | alfa | 10 | 0 | false | null | Reservado (uso Banco) |
| `subsequencia_1` | [48,49] | num | 2 | 0 | false | `'01'` | Subsequência do 1º bloco de mensagem |
| `mensagem_1` | [50,99] | alfa | 50 | 0 | false | null | 1º bloco de mensagem variável por boleto |
| `subsequencia_2` | [100,101] | num | 2 | 0 | false | `'02'` | Subsequência do 2º bloco de mensagem |
| `mensagem_2` | [102,151] | alfa | 50 | 0 | false | null | 2º bloco de mensagem variável por boleto |
| `subsequencia_3` | [152,153] | num | 2 | 0 | false | null | Subsequência do 3º bloco — manual mostra `'02'` (repetido do bloco 2), provável erro de digitação; não fixar padrão até confirmar |
| `mensagem_3` | [154,203] | alfa | 50 | 0 | false | null | 3º bloco de mensagem variável por boleto |
| `reservado_3` | [204,382] | alfa | 179 | 0 | false | null | Reservado (uso Banco) |
| `identificador_complemento` | [383,383] | alfa | 1 | 0 | false | null | Identificador do complemento (nota 2 do manual) |
| `complemento` | [384,385] | num | 2 | 0 | false | null | Complemento (nota 2 do manual) |
| `reservado_4` | [386,394] | alfa | 9 | 0 | false | null | Reservado (uso Banco), brancos |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

Total: 400 posições, conferido (soma exata, sem gap/sobreposição).

## Nenhuma evidência real disponível

O fixture do projeto (`tests/fixtures/cnab400/santander/SANTANDER_cnab_400_140.REM`, 130 linhas) **não contém** nenhum registro tipo 2/4/5/6/7 — só tipos 0, 1 e 9. `brcobranca` e `laravel-boleto` também não implementam este registro para o Santander. Todas as posições acima vêm exclusivamente do manual oficial 2025 — sem confirmação cruzada de biblioteca de terceiros.
