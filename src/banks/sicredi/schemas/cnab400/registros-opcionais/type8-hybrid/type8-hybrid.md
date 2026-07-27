# Registro Tipo 8 — Híbrido / QR Code (Remessa, obrigatório condicional)

> Fonte: manual oficial Sicredi, `2026_03_12_manual_cnab_400_30.pdf` (v3.0, fev/2026), §8.7, p.36. Sem confirmação de terceiros — nenhuma lib do projeto implementa este registro (o `laravel-boleto` tem um campo `getChaveNfe()` de conceito diferente, extensão CNAB 444 do detalhe, não relacionado a boleto híbrido/PIX).

## O que é

Único registro opcional que o manual classifica como **"Obrigatório quando emissão de boleto híbrido"** — não é livre como os outros quatro (tipo 2, 5, 6, 7), é condicional ao campo `tipo_boleto` do detalhe (posição 6 = `'H'`). Carrega o TXID (código de identificação do QR Code) vinculado ao título — mas o próprio manual instrui deixar esse campo em branco, porque é o Sicredi quem gera o TXID e faz o vínculo.

## Regras importantes (manual)

- Obrigatório **somente quando** o detalhe (tipo 1) tem `tipo_boleto` (posição 6) = `'H'` (Híbrido).
- Campo `txid` deve ser enviado em branco — o Sicredi gera e vincula automaticamente.
- Campo `numero_documento` (31-40) deve bater com o mesmo campo do detalhe (posições 111-120).

## Campos

| Campo | Posição | Tipo | Tamanho | Obrigatório | Descrição |
| -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | true | `'8'` |
| `nosso_numero_sicredi_sem_edicao` | [2,16] | alfa | 15 | false | Nosso número, sem edição |
| `brancos_1` | [17,17] | alfa | 1 | false | Complemento de registro |
| `hibrido` | [18,18] | alfa | 1 | true | `'H'` |
| `brancos_2` | [19,30] | alfa | 12 | false | Complemento de registro |
| `numero_documento` | [31,40] | alfa | 10 | false | "Seu número" — deve bater com posições 111-120 do detalhe |
| `txid` | [41,75] | alfa | 35 | false | Código de identificação do QR Code — enviar em branco, Sicredi gera e vincula |
| `brancos_3` | [76,394] | alfa | 319 | false | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | true | Sequencial do registro no arquivo |

## Nota de extração

A coluna CONTEÚDO desta tabela do PDF ficou com resíduo de outra célula (valores como `'999999999'` e `'748'` aparecem fora de contexto) — não usados na reconstrução. Só as colunas INÍCIO/FINAL/TAM e os rótulos de campo que ficaram claros foram usados; a soma das posições fecha em exatos 400 bytes.

## Nenhuma evidência de biblioteca de terceiros

Nem `laravel-boleto` nem `brcobranca` implementam este registro — só o manual oficial documenta.
