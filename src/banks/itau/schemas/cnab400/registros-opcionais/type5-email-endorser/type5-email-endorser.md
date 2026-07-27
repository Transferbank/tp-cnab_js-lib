# Registro Tipo 5 — E-mail / Dados do Sacador-Avalista (Remessa, opcional)

> Fonte: manual oficial Itaú, `layout_cobranca_400bytes_cnab_itau.pdf`, p.12 (fevereiro/2016). Posições extraídas diretamente do PDF (`pdftotext`).

## O que é

Registro inteiro separado, opcional, para (a) informar o e-mail do pagador para entrega do boleto por e-mail e/ou (b) complementar os dados do sacador/avalista quando este existir.

## Regras importantes (manual)

- Opcional. Só precisa ser enviado quando o beneficiário quiser que o boleto seja entregue por e-mail pelo Itaú, ou queira complementar os dados do sacador/avalista.
- Quando enviado, deve vir na sequência do registro obrigatório de cobrança (tipo 1) ao qual seus dados se referem.
- **As informações deste registro não são devolvidas no arquivo de retorno.**
- Quando os dados de "Sacador/Avalista" aparecem tanto no registro tipo 1 quanto no tipo 5, **prevalece sempre o do tipo 5**.
- Na fase de testes, o envio do boleto por e-mail não funciona — o boleto é emitido e entregue fisicamente.

## Campos

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'5'` | Identificação do registro (e-mail / sacador-avalista) |
| `email_pagador` | [2,121] | alfa | 120 | 0 | false | null | Endereço de e-mail do pagador (NOTA 29) |
| `sacador_codigo_inscricao` | [122,123] | num | 2 | 0 | false | null | Tipo de inscrição do sacador/avalista (NOTA 30) |
| `sacador_numero_inscricao` | [124,137] | num | 14 | 0 | false | null | CPF/CNPJ do sacador/avalista (NOTA 30) |
| `sacador_logradouro` | [138,177] | alfa | 40 | 0 | false | null | Rua, número e complemento do sacador/avalista (NOTA 30) |
| `sacador_bairro` | [178,189] | alfa | 12 | 0 | false | null | Bairro do sacador/avalista (NOTA 30) |
| `sacador_cep` | [190,197] | num | 8 | 0 | false | null | CEP do sacador/avalista (NOTA 30) |
| `sacador_cidade` | [198,212] | alfa | 15 | 0 | false | null | Cidade do sacador/avalista (NOTA 30) |
| `sacador_estado` | [213,214] | alfa | 2 | 0 | false | null | UF do sacador/avalista (NOTA 30) |
| `brancos` | [215,394] | alfa | 180 | 0 | false | null | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

Conferência de tamanho: `394 - 215 + 1 = 180`, bate exatamente com a *picture* `X(180)` do manual — sem inconsistência aqui (diferente do que ocorre no registro tipo 2).

## Nenhuma evidência real disponível

O fixture real do projeto (`ITAU_cnab_400.REM`) não contém nenhum registro tipo 5 — só tipos 0, 1, 2 e 9. As posições acima vêm só do manual oficial.
