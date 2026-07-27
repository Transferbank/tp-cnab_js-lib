# Registro Tipo 5 — Informativo (Remessa, opcional)

> Fonte: manual oficial Sicredi, `2026_03_12_manual_cnab_400_30.pdf` (v3.0, fev/2026), §8.4, p.32. Sem confirmação de terceiros — nenhuma lib do projeto (`laravel-boleto`, `brcobranca`) implementa este registro.

## O que é

Registro opcional pra incluir dados/texto adicional ao boleto, além do que cabe no registro Mensagem (tipo 2). Cada registro tem 4 linhas de texto (80 caracteres cada, numeradas de 1 a 99); o conjunto pode ter até 5 registros tipo 5 encadeados por título, totalizando até 20 linhas de informativo.

## Regras importantes (manual)

- Opcional — usar só quando necessário incluir dados adicionais ao boleto.
- O registro de cadastro do título (tipo 1) deve vir **antes** do registro informativo correspondente.
- Até 5 registros tipo 5 por título (20 linhas no total).
- Campo `identificacao_titulo_seu_numero` (8-17) deve bater com o mesmo campo do detalhe (posições 111-120).

## Campos

| Campo | Posição | Tipo | Tamanho | Obrigatório | Descrição |
| -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | true | `'5'` |
| `tipo_informativo` | [2,2] | alfa | 1 | true | `'E'` = Específico de um título |
| `codigo_beneficiario_cedente` | [3,7] | num | 5 | true | Código do beneficiário/cedente na Cooperativa |
| `identificacao_titulo_seu_numero` | [8,17] | alfa | 10 | false | Deve bater com posições 111-120 do detalhe |
| `brancos_1` | [18,18] | alfa | 1 | false | Complemento de registro |
| `tipo_cobranca` | [19,19] | alfa | 1 | true | `'A'` = Cobrança com registro |
| `numero_linha_informativo_1` | [20,21] | num | 2 | false | Número da linha (1-99) |
| `texto_linha_informativo_1` | [22,101] | alfa | 80 | false | Texto livre |
| `numero_linha_informativo_2` | [102,103] | num | 2 | false | Número da linha (1-99) |
| `texto_linha_informativo_2` | [104,183] | alfa | 80 | false | Texto livre |
| `numero_linha_informativo_3` | [184,185] | num | 2 | false | Número da linha (1-99) |
| `texto_linha_informativo_3` | [186,265] | alfa | 80 | false | Texto livre |
| `numero_linha_informativo_4` | [266,267] | num | 2 | false | Número da linha (1-99) |
| `texto_linha_informativo_4` | [268,347] | alfa | 80 | false | Texto livre |
| `brancos_2` | [348,394] | alfa | 47 | false | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | true | Sequencial do registro no arquivo |

## Nota de extração

O texto do PDF ficou parcialmente embaralhado nesta tabela (colunas de descrição longa quebrando em múltiplas linhas confundem o `pdftotext`) — as posições acima foram reconstruídas a partir das colunas INÍCIO/FINAL/TAM, que permaneceram consistentes, e conferidas por soma (total exato de 400 bytes, sem gaps nem sobreposição).

## Nenhuma evidência de biblioteca de terceiros

Nem `laravel-boleto` nem `brcobranca` implementam este registro — só o manual oficial documenta.
